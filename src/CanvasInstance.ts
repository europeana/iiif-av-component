namespace IIIFComponents {

    export class CanvasInstance {
        
	    private _highPriorityFrequency: number = 25;
	    private _lowPriorityFrequency: number = 100;
        private _canvasClockFrequency: number = 25;
        private _canvasClockInterval: number;
        private _highPriorityInterval: number;
        private _lowPriorityInterval: number;
        private _mediaElements: any[]; // todo: type as HTMLMediaElement?
        public $playerElement: JQuery | null = null;
        public canvasClockDuration: number = 0; // todo: should these 0 values be undefined by default?
        public canvasClockStartDate: number = 0;
        public canvasClockTime: number = 0;
        public canvasHeight: number = 0;
        public canvasWidth: number = 0;
        public data: Manifesto.ICanvas | null = null;
        public isPlaying: boolean = false;
        public isStalled: boolean = false;
        public logMessage: (message: string) => void;
        public stallRequestedBy: any[] = []; //todo: type
        public wasPlaying: boolean = false;

        constructor(canvas: Manifesto.ICanvas) {
            this.data = canvas;
            this.canvasClockDuration = <number>canvas.getDuration();
        } 

        public initContents() {

            if (!this.data) return;

            this._mediaElements = [];

            var mediaItems = (<any>this.data).__jsonld.content[0].items; //todo: use canvas.getContent()

            for (let i = 0; i < mediaItems.length; i++) {

                var mediaItem = mediaItems[i];
                
                /*
                if (mediaItem.motivation != 'painting') {
                    return null;
                }
                */

                var mediaSource;

                if (mediaItem.body.type == 'TextualBody') {
                    mediaSource = mediaItem.body.value;
                } else if (Array.isArray(mediaItem.body) && mediaItem.body[0].type == 'Choice') {
                    // Choose first "Choice" item as body
                    var tmpItem = mediaItem;
                    mediaItem.body = tmpItem.body[0].items[0];

                    mediaSource = mediaItem.body.id.split('#')[0];
                } else {
                    mediaSource = mediaItem.body.id.split('#')[0];
                }
                
                /*
                var targetFragment = (mediaItem.target.indexOf('#') != -1) ? mediaItem.target.split('#t=')[1] : '0, '+ canvasClockDuration,
                    fragmentTimings = targetFragment.split(','),
                    startTime = parseFloat(fragmentTimings[0]),
                    endTime = parseFloat(fragmentTimings[1]);

                //TODO: Check format (in "target" as MFID or in "body" as "width", "height" etc.)
                var fragmentPosition = [0, 0, 100, 100],
                    positionTop = fragmentPosition[1],
                    positionLeft = fragmentPosition[0],
                    mediaWidth = fragmentPosition[2],
                    mediaHeight = fragmentPosition[3];
                */

                var spatial = /xywh=([^&]+)/g.exec(mediaItem.target);
                var temporal = /t=([^&]+)/g.exec(mediaItem.target);
                
                var xywh;
                if (spatial && spatial[1]) {
                    xywh = spatial[1].split(',');
                } else {
                    xywh = [0, 0, this.canvasWidth, this.canvasHeight];
                }

                var t;
                if(temporal && temporal[1]) {
                    t = temporal[1].split(',');
                } else {
                    t = [0, this.canvasClockDuration];
                }

                var positionLeft = parseInt(<string>xywh[0]),
                    positionTop = parseInt(<string>xywh[1]),
                    mediaWidth = parseInt(<string>xywh[2]),
                    mediaHeight = parseInt(<string>xywh[3]),
                    startTime = parseInt(<string>t[0]),
                    endTime = parseInt(<string>t[1]);
                
                var percentageTop = this._convertToPercentage(positionTop, this.canvasHeight),
                    percentageLeft = this._convertToPercentage(positionLeft, this.canvasWidth),
                    percentageWidth = this._convertToPercentage(mediaWidth, this.canvasWidth),
                    percentageHeight = this._convertToPercentage(mediaHeight, this.canvasHeight);

                var temporalOffsets = /t=([^&]+)/g.exec(mediaItem.body.id);

                var ot;
                if(temporalOffsets && temporalOffsets[1]) {
                    ot = temporalOffsets[1].split(',');
                } else {
                    ot = [null, null];
                }

                var offsetStart = (ot[0]) ? parseInt(<string>ot[0]) : ot[0],
                    offsetEnd = (ot[1]) ? parseInt(<string>ot[1]) : ot[1];
                
                var itemData = {
                    'type': mediaItem.body.type,
                    'source': mediaSource,
                    'start': startTime, 
                    'end': endTime, 
                    'top': percentageTop, 
                    'left': percentageLeft, 
                    'width': percentageWidth, 
                    'height': percentageHeight, 
                    'startOffset': offsetStart,
                    'endOffset': offsetEnd,
                    'active': false
                }

                this._renderMediaElement(itemData);
            }
        }

        private _convertToPercentage(pixelValue: number, maxValue: number): number {
            const percentage: number = (pixelValue / maxValue) * 100;
            return percentage;
        }

        private _renderMediaElement(data: any): void {

            var mediaElement;

            switch(data.type) {
                case 'Image':
                    mediaElement = $('<img class="anno" src="' + data.source + '" />');
                    break;
                case 'Video':
                    mediaElement = $('<video class="anno" src="' + data.source + '" />');
                    break;
                case 'Audio':
                    mediaElement = $('<audio class="anno" src="' + data.source + '" />');
                    break;
                case 'TextualBody':
                    mediaElement = $('<div class="anno">' + data.source + '</div>');
                    break;
                default:
                    return;
            }

            mediaElement.css({
                top: data.top + '%',
                left: data.left + '%',
                width: data.width + '%',
                height: data.height + '%'
            }).hide();

            data.element = mediaElement;

            if (data.type == 'Video' || data.type == 'Audio') {
                
                data.timeout = null;

                var that = this;

                data.checkForStall = function() {

                    var self = this;
                    
                    if (this.active) {
                        that.checkMediaSynchronization();
                        if (this.element.get(0).readyState > 0 && !this.outOfSync) {
                            that.playbackStalled(false, self);
                        } else {
                            that.playbackStalled(true, self);
                            if (this.timeout) {
                                window.clearTimeout(this.timeout);
                            }
                            this.timeout = window.setTimeout(function() {
                                self.checkForStall();
                            }, 1000);
                        }

                    } else {
                        that.playbackStalled(false, self);
                    }

                }
            }

            this._mediaElements.push(data);

            if (this.$playerElement) {
                const targetElement = this.$playerElement.find('.canvasContainer');
                targetElement.append(mediaElement);
            }
            
            if (data.type == 'Video' || data.type == 'Audio') {
                var self = data;
                mediaElement.on('loadstart', function() {
                    //console.log('loadstart');
                    self.checkForStall();
                });
                mediaElement.on('waiting', function() {
                    //console.log('waiting');
                    self.checkForStall();
                });
                mediaElement.on('seeking', function() {
                    //console.log('seeking');
                    //self.checkForStall();
                });
                mediaElement.attr('preload', 'auto');
                (<any>mediaElement.get(0)).load(); // todo: type
            }

            this._renderSyncIndicator(data);

        }

        private _renderSyncIndicator(mediaElementData: any) {

            const leftPercent: number = this._convertToPercentage(mediaElementData.start, this.canvasClockDuration);
            const widthPercent: number = this._convertToPercentage(mediaElementData.end - mediaElementData.start, this.canvasClockDuration);

            const timelineItem: JQuery = $('<div class="timelineItem" title="'+ mediaElementData.source +'" data-start="'+ mediaElementData.start +'" data-end="'+ mediaElementData.end +'"></div>');

            timelineItem.css({
                left: leftPercent + '%',
                width: widthPercent + '%'
            });

            const lineWrapper: JQuery = $('<div class="lineWrapper"></div>');

            timelineItem.appendTo(lineWrapper);

            mediaElementData.timelineElement = timelineItem;

            if (this.$playerElement) {
                var itemContainer = this.$playerElement.find('.timelineItemContainer');
                itemContainer.append(lineWrapper);
            }
        }

        public setCurrentTime(seconds: string | number): void { // todo: why is this a string or a number? can it just be a number?
		
            const secondsAsFloat: number = parseFloat(<string>seconds);

            if (isNaN(secondsAsFloat)) {
                return;
            }

            this.canvasClockTime = secondsAsFloat;
            this.canvasClockStartDate = Date.now() - (this.canvasClockTime * 1000)

            this.logMessage('SET CURRENT TIME to: '+ this.canvasClockTime + ' seconds.');

            this.canvasClockUpdater();
            this.highPriorityUpdater();
            this.lowPriorityUpdater();

            this.synchronizeMedia();            
        }

        public playCanvas(withoutUpdate?: boolean): void {
            if (this.isPlaying) return;

            if (this.canvasClockTime === this.canvasClockDuration) {
                this.canvasClockTime = 0;
            }

            this.canvasClockStartDate = Date.now() - (this.canvasClockTime * 1000);

            var self = this;
            this._highPriorityInterval = window.setInterval(function() {
                self.highPriorityUpdater();
            }, this._highPriorityFrequency);
            this._lowPriorityInterval = window.setInterval(function() {
                self.lowPriorityUpdater();
            }, this._lowPriorityFrequency);
            this._canvasClockInterval = window.setInterval(function() {
                self.canvasClockUpdater();
            }, this._canvasClockFrequency);

            this.isPlaying = true;

            if (!withoutUpdate) {
                this.synchronizeMedia();
            }

            this.logMessage('PLAY canvas');
        }

        public pauseCanvas(withoutUpdate?: boolean): void {
            window.clearInterval(this._highPriorityInterval);
            window.clearInterval(this._lowPriorityInterval);

            window.clearInterval(this._canvasClockInterval);

            this.isPlaying = false;

            if (!withoutUpdate) {
                this.highPriorityUpdater();
                this.lowPriorityUpdater();
                this.synchronizeMedia();
            }

            this.logMessage('PAUSE canvas');
        }

        public canvasClockUpdater(): void {
            this.canvasClockTime = (Date.now() - this.canvasClockStartDate) / 1000;

            if (this.canvasClockTime >= this.canvasClockDuration) {
                this.canvasClockTime = this.canvasClockDuration;
                this.pauseCanvas();
            }
        }

        public highPriorityUpdater(): void {

            if (!this.$playerElement) return;

            const $timeLineContainer: JQuery = this.$playerElement.find('.timelineContainer');
            $timeLineContainer.slider({
                value: this.canvasClockTime
            });
            this.$playerElement.find('.canvasTime').text(AVComponentUtils.Utils.formatTime(this.canvasClockTime) );
        }

        public lowPriorityUpdater(): void {
            this.updateMediaActiveStates();
        }

        public updateMediaActiveStates(): void {

            var mediaElement;

            for (var i=0; i<this._mediaElements.length; i++) {

                mediaElement = this._mediaElements[i];

                if ( mediaElement.start <= this.canvasClockTime && mediaElement.end >= this.canvasClockTime ) {

                    this.checkMediaSynchronization();

                    if (!mediaElement.active) {
                        this.synchronizeMedia();
                        mediaElement.active = true;
                        mediaElement.element.show();
                        mediaElement.timelineElement.addClass('active');
                    }

                    if (mediaElement.type == 'Video' || mediaElement.type == 'Audio') {

                        if (mediaElement.element[0].currentTime > mediaElement.element[0].duration - mediaElement.endOffset) {
                            mediaElement.element[0].pause();
                        }

                    }

                } else {

                    if (mediaElement.active) {
                        mediaElement.active = false;
                        mediaElement.element.hide();
                        mediaElement.timelineElement.removeClass('active');
                        if (mediaElement.type == 'Video' || mediaElement.type == 'Audio') {
                            mediaElement.element[0].pause();
                        }
                    }

                }

            }

            //this.logMessage('UPDATE MEDIA ACTIVE STATES at: '+ this.canvasClockTime + ' seconds.');

        }

        public synchronizeMedia(): void {

            var mediaElement;

            for (var i=0; i<this._mediaElements.length; i++) {

                mediaElement = this._mediaElements[i];
                
                if (mediaElement.type == 'Video' || mediaElement.type == 'Audio') {

                    mediaElement.element[0].currentTime = this.canvasClockTime - mediaElement.start + mediaElement.startOffset;

                    if ( mediaElement.start <= this.canvasClockTime && mediaElement.end >= this.canvasClockTime ) {
                        if (this.isPlaying) {
                            if (mediaElement.element[0].paused) {
                                var promise = mediaElement.element[0].play();
                                if (promise) {
                                    promise.catch(function(){});
                                }
                            }
                        } else {
                            mediaElement.element[0].pause();
                        }
                    } else {
                        mediaElement.element[0].pause();
                    }

                    if (mediaElement.element[0].currentTime > mediaElement.element[0].duration - mediaElement.endOffset) {
                        mediaElement.element[0].pause();
                    }

                }


            }

            this.logMessage('SYNC MEDIA at: '+ this.canvasClockTime + ' seconds.');
            
        }

        public checkMediaSynchronization(): void {
	
            var mediaElement;

            for (let i = 0, l = this._mediaElements.length; i < l; i++) {
                
                mediaElement = this._mediaElements[i];

                if ((mediaElement.type == 'Video' || mediaElement.type == 'Audio') && 
                    (mediaElement.start <= this.canvasClockTime && mediaElement.end >= this.canvasClockTime) ) {

                    const correctTime: number = (this.canvasClockTime - mediaElement.start + mediaElement.startOffset);
                    const factualTime: number = mediaElement.element[0].currentTime;

                    // off by 0.2 seconds
                    if (Math.abs(factualTime - correctTime) > 0.4) {
                        
                        mediaElement.outOfSync = true;
                        //this.playbackStalled(true, mediaElement);
                        
                        const lag: number = Math.abs(factualTime - correctTime);
                        this.logMessage('DETECTED synchronization lag: '+ Math.abs(lag) );
                        mediaElement.element[0].currentTime = correctTime;
                        //this.synchronizeMedia();

                    } else {
                        mediaElement.outOfSync = false;
                        //this.playbackStalled(false, mediaElement);
                    }

                }

            }

        }

        public playbackStalled(aBoolean: boolean, syncMediaRequestingStall: any): void {

            if (aBoolean) {

                if (this.stallRequestedBy.indexOf(syncMediaRequestingStall) < 0) {
                    this.stallRequestedBy.push(syncMediaRequestingStall);
                }

                if (!this.isStalled) {

                    if (this.$playerElement) {
                        this._showWorkingIndicator(this.$playerElement.find('.canvasContainer'));
                    }

                    this.wasPlaying = this.isPlaying;

                    this.pauseCanvas(true);

                    this.isStalled = aBoolean;

                }

            } else {

                var idx = this.stallRequestedBy.indexOf(syncMediaRequestingStall);
                if (idx >= 0) {
                    this.stallRequestedBy.splice(idx, 1);
                }

                if (this.stallRequestedBy.length === 0) {

                    this._hideWorkingIndicator();

                    if (this.isStalled && this.wasPlaying) {

                        this.playCanvas(true);

                    }

                    this.isStalled = aBoolean;

                }

            }

        }

        private _showWorkingIndicator($targetElement: JQuery): void {
            var workingIndicator = $('<div class="workingIndicator">Waiting ...</div>');
            if ($targetElement.find('.workingIndicator').length == 0) {
                $targetElement.append(workingIndicator);
            }
            //console.log('show working');
        }

        private _hideWorkingIndicator() {
            $('.workingIndicator').remove();
            //console.log('hide working');
        }
    }
}