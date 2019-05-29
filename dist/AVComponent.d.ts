/// <reference types="manifesto.js" />
/// <reference types="@iiif/manifold" />
/// <reference types="@iiif/base-component" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
declare namespace IIIFComponents {
    interface IAVCanvasInstanceData extends IAVComponentData {
        canvas?: Manifesto.ICanvas | VirtualCanvas;
        range?: Manifesto.IRange;
        visible?: boolean;
        volume?: number;
    }
    interface IAVComponentContent {
        currentTime: string;
        collapse: string;
        duration: string;
        expand: string;
        mute: string;
        next: string;
        pause: string;
        play: string;
        previous: string;
        unmute: string;
    }
    interface IAVComponentData {
        [key: string]: any;
        adaptiveAuthEnabled?: boolean;
        autoPlay?: boolean;
        autoSelectRange?: boolean;
        canvasId?: string;
        constrainNavigationToRange?: boolean;
        content?: IAVComponentContent;
        defaultAspectRatio?: number;
        doubleClickMS?: number;
        helper?: Manifold.IHelper;
        halveAtWidth?: number;
        limitToRange?: boolean;
        posterImageRatio?: number;
        rangeId?: string;
        virtualCanvasEnabled?: boolean;
        waveformBarSpacing?: number;
        waveformBarWidth?: number;
        waveformColor?: string;
    }
    interface IAVVolumeControlState {
        volume?: number;
    }
    interface IMaxMin {
        max: number;
        min: number;
    }
    class AVVolumeControl extends _Components.BaseComponent {
        private _$volumeSlider;
        private _$volumeMute;
        private _lastVolume;
        private _data;
        constructor(options: _Components.IBaseComponentOptions);
        protected _init(): boolean;
        set(data: IAVVolumeControlState): void;
        private _render;
        protected _resize(): void;
    }
    class VolumeEvents {
        static VOLUME_CHANGED: string;
    }
    class CanvasInstance extends _Components.BaseComponent {
        private _$canvasContainer;
        private _$canvasDuration;
        private _$canvasHoverHighlight;
        private _$canvasHoverPreview;
        private _$canvasTime;
        private _$canvasTimelineContainer;
        private _$controlsContainer;
        private _$durationHighlight;
        private _$hoverPreviewTemplate;
        private _$nextButton;
        private _$optionsContainer;
        private _$playButton;
        private _$prevButton;
        private _$rangeHoverHighlight;
        private _$rangeHoverPreview;
        private _$rangeTimelineContainer;
        private _$timeDisplay;
        private _$timelineItemContainer;
        private _canvasClockFrequency;
        private _canvasClockInterval;
        private _canvasClockStartDate;
        private _canvasClockTime;
        private _canvasHeight;
        private _canvasWidth;
        private _compositeWaveform;
        private _contentAnnotations;
        private _data;
        private _highPriorityFrequency;
        private _highPriorityInterval;
        private _isPlaying;
        private _isStalled;
        private _lowPriorityFrequency;
        private _lowPriorityInterval;
        private _mediaSyncMarginSecs;
        private _rangeSpanPadding;
        private _readyMediaCount;
        private _stallRequestedBy;
        private _volume;
        private _wasPlaying;
        private _waveformCanvas;
        private _waveformCtx;
        ranges: Manifesto.IRange[];
        waveforms: string[];
        $playerElement: JQuery;
        isOnlyCanvasInstance: boolean;
        logMessage: (message: string) => void;
        constructor(options: _Components.IBaseComponentOptions);
        loaded(): void;
        isPlaying(): boolean;
        getClockTime(): number;
        init(): void;
        private _getBody;
        private _getDuration;
        data(): IAVCanvasInstanceData;
        isVirtual(): boolean;
        isVisible(): boolean;
        includesVirtualSubCanvas(canvasId: string): boolean;
        set(data: IAVCanvasInstanceData): void;
        private _hasRangeChanged;
        private _getRangeForCurrentTime;
        private _rangeSpansCurrentTime;
        private _rangeNavigable;
        private _render;
        getCanvasId(): string | undefined;
        private _updateHoverPreview;
        private _previous;
        private _next;
        destroy(): void;
        private _convertToPercentage;
        private _renderMediaElement;
        private _getWaveformData;
        private waveformDeltaX;
        private waveformPageX;
        private _renderWaveform;
        private _drawWaveform;
        private _scaleY;
        private _getWaveformMaxAndMin;
        private _updateCurrentTimeDisplay;
        private _updateDurationDisplay;
        private _renderSyncIndicator;
        setCurrentTime(seconds: number): void;
        private _setCurrentTime;
        private _rewind;
        private _fastforward;
        play(withoutUpdate?: boolean): void;
        pause(withoutUpdate?: boolean): void;
        private _isNavigationConstrainedToRange;
        private _canvasClockUpdater;
        private _highPriorityUpdater;
        private _lowPriorityUpdater;
        private _updateMediaActiveStates;
        private _pauseMedia;
        private _setMediaCurrentTime;
        private _synchronizeMedia;
        private _checkMediaSynchronization;
        private _playbackStalled;
        resize(): void;
    }
    class CanvasInstanceEvents {
        static NEXT_RANGE: string;
        static PAUSECANVAS: string;
        static PLAYCANVAS: string;
        static PREVIOUS_RANGE: string;
    }
    class CompositeWaveform {
        private _waveforms;
        length: number;
        duration: number;
        pixelsPerSecond: number;
        secondsPerPixel: number;
        private timeIndex;
        private minIndex;
        private maxIndex;
        constructor(waveforms: any[]);
        min(index: number): number;
        max(index: number): number;
        _find(index: number): Waveform | null;
    }
    class AVComponentUtils {
        private static _compare;
        static diff(a: any, b: any): string[];
        static getSpatialComponent(target: string): number[] | null;
        static getFirstTargetedCanvasId(range: Manifesto.IRange): string | undefined;
        static getTimestamp(): string;
        static retargetTemporalComponent(canvases: Manifesto.ICanvas[], target: string): string | undefined;
        static formatTime(aNumber: number): string;
        static isIE(): number | boolean;
        static isSafari(): boolean;
        static debounce(fn: any, debounceDuration: number): any;
        static hlsMimeTypes: string[];
        static normalise(num: number, min: number, max: number): number;
        static isHLSFormat(format: Manifesto.MediaType): boolean;
        static isMpegDashFormat(format: Manifesto.MediaType): boolean;
        static canPlayHls(): boolean;
    }
    class VirtualCanvas {
        canvases: Manifesto.ICanvas[];
        id: string;
        constructor();
        addCanvas(canvas: Manifesto.ICanvas): void;
        getContent(): Manifesto.IAnnotation[];
        getDuration(): number | null;
        getWidth(): number;
        getHeight(): number;
    }
    class Waveform {
        start: number;
        end: number;
        waveform: any;
    }
    class AVComponent extends _Components.BaseComponent {
        private _data;
        options: _Components.IBaseComponentOptions;
        canvasInstances: CanvasInstance[];
        private _checkAllMediaReadyInterval;
        private _checkAllWaveformsReadyInterval;
        private _readyMedia;
        private _readyWaveforms;
        private _posterCanvasWidth;
        private _posterCanvasHeight;
        private _$posterContainer;
        private _$posterImage;
        private _$posterExpandButton;
        private _posterImageExpanded;
        constructor(options: _Components.IBaseComponentOptions);
        protected _init(): boolean;
        getCurrentCanvasInstance(): Manifesto.ICanvas | null;
        data(): IAVComponentData;
        set(data: IAVComponentData): void;
        private _render;
        reset(): void;
        private _reset;
        setCurrentTime(time: number): void;
        getCurrentTime(): number;
        isPlaying(): boolean;
        private _checkAllMediaReady;
        private _checkAllWaveformsReady;
        private _getCanvasInstancesWithWaveforms;
        private _getCanvases;
        private _initCanvas;
        getCurrentRange(): Manifesto.IRange | null;
        private _prevRange;
        private _nextRange;
        private _setCanvasInstanceVolumes;
        private _getNormaliseCanvasId;
        private _getCanvasInstanceById;
        private _getCurrentCanvas;
        private _rewind;
        play(): void;
        pause(): void;
        playRange(rangeId: string, autoChanged?: boolean): void;
        showCanvas(canvasId: string): void;
        private _logMessage;
        private _getPosterImageCss;
        resize(): void;
    }
}
declare namespace IIIFComponents.AVComponent {
    class Events {
        static PLAY: string;
        static PAUSE: string;
        static MEDIA_READY: string;
        static MEDIA_ERROR: string;
        static LOG: string;
        static RANGE_CHANGED: string;
        static WAVEFORM_READY: string;
        static WAVEFORMS_READY: string;
    }
}