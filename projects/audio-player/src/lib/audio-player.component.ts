import { CommonModule } from '@angular/common';
import { Component, input, OnInit, Input, ViewChild, ElementRef, model, output, effect, computed, WritableSignal, signal, Signal, AfterViewInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSlider, MatSliderModule } from '@angular/material/slider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { SecondsToMinutesPipe } from './pipes/second-to-minutes.pipe';
import { FormsModule } from '@angular/forms';
import { Track } from './model/track.model';
import { MatButtonModule } from '@angular/material/button';
import { AudioPlayerService } from './audio-player.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatSliderModule, MatTableModule, MatExpansionModule, MatPaginatorModule, MatButtonModule, SecondsToMinutesPipe],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit, AfterViewInit {
  // all || one || none
  repeat = model<"all" | "one" | "none">('all');
  endOffset = model(0);
  displayTitle = input(true);
  displayPlaylist = input(true);
  displayVolumeControls = input(true);
  displayVolumeSlider = input(false);
  displayRepeatControls = input(true);
  pageSizeOptions = input([10, 20, 30]);
  expanded = input(true);
  autoPlay = input(false);
  disablePositionSlider = input(false);
  displayArtist = input(false);
  displayDuration = input(false);
  playlist = input<Track[]>([]);

  // Support for internationalization
  tableHeader = input('Playlist');
  titleHeader = input('Title');
  artistHeader = input('Artist');
  durationHeader = input('Duration');

  trackPlaying = output<string>();
  trackPaused = output<string>();
  trackEnded = output<string>();
  nextTrackRequested = output<string>();
  previousTrackRequested = output<string>();
  trackSelected = output<string>();

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Track>();
  paginator: MatPaginator;
  timeLineDuration: MatSlider;
  mediaType: string = '';
  tracks: Track[] = [];
  currentIndex = 0;
  // iOS = (/iPad|iPhone|iPod/.test(navigator.platform)
  //   || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  loaderDisplay = false;
  isPlaying = false;
  currentTime = 0;
  volume = 0.5;
  toggledVolume = 1.0;
  duration = 0.01;
  private startOffsetValue = 0;

  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild('audioPlayer', { static: true }) playerElementRef: ElementRef;
  player: HTMLAudioElement

  audioplayerService = inject(AudioPlayerService);

  constructor(elem: ElementRef) {
    if (elem.nativeElement.tagName.toLowerCase() === 'mat-advanced-audio-player') {
      console.warn(`'mat-advanced-audio-player' selector is deprecated; use 'ngx-audio-player' instead.`);
    }

    computed(() => {
      this.tracks = this.playlist()
      this.setDataSourceAttributes();
    });

    effect(() => {
      // Trigger `buildDisplayedColumns()` whenever any of the inputs change
      console.log('displayArtist:', this.displayArtist(), 'displayDuration:', this.displayDuration());
      this.buildDisplayedColumns();
    });

    effect(() => {
      const tracks = this.audioplayerService.playlist()
      if (tracks !== null && tracks.length > 0) {
        this.tracks = tracks;
        this.initialize();
      }
    });
  }

  ngOnInit() {
    this.tracks = this.playlist()
    this.player = this.playerElementRef.nativeElement;
    this.player.volume = this.volume;
  }

  ngAfterViewInit() {
    if (this.player) {
      this.player.addEventListener('seeking', () => {
        console.log('Seeking detected at:', this.player.currentTime);
      });
    }
  }

  initialize() {
    this.buildDisplayedColumns();

    // populate indexs for the track and configure
    // material table data source and paginator
    this.setDataSourceAttributes();


    this.player.currentTime = this.startOffset;
    this.updateCurrentTrack();

    if (this.autoPlay()) {
      this.triggerPlay();
    }
  }

  @Input()
  set startOffset(seconds: number) {
    this.startOffsetValue = seconds;
    this.player.currentTime = seconds;
  }

  get startOffset(): number {
    return this.startOffsetValue;
  }

  play() {    
    if (!this.isPlaying) {
      setTimeout(() => {
        this.isPlaying = true;
        this.player.play();
        this.audioplayerService.currentTrack.set(this.tracks[this.currentIndex]);        
      }, 50);
    }
  }

  pause() {
    if (this.isPlaying) {
      setTimeout(() => {
        this.isPlaying = false;
        this.player.pause();
      }, 50);
    }
  }

  stop() {
    setTimeout(() => {
      this.isPlaying = false;
      this.player.pause();
      this.player.currentTime = 0;
    }, 50);
  }

  currVolumeChanged(event: any) {
    const value = event.valuie || event.target.value

    this.volume = value;
    this.toggledVolume = value;
    this.player.volume = value;
  }

  onPlaying() {
    this.isPlaying = true;
    this.audioplayerService.currentTrack.set(this.tracks[this.currentIndex]);
    this.trackPlaying.emit("TrackPlaying");
    this.duration = Math.floor(this.player.duration);
  }

  onPause() {
    this.isPlaying = false;
    this.trackPaused.emit("TrackPaused");
  }

  onTimeUpdate() {
    this.currentTime = Math.floor(this.player.currentTime);
    this.audioplayerService.currentTime.set(this.currentTime);
  }

  onMetadataLoaded() {
    this.loaderDisplay = false;
    this.duration = Math.floor(this.player.duration) || 0;
  }

  onTrackEnded() {
    this.trackEnded.emit("TrackEnded");

    // autoplay next track if repeat is set to 'all' or 'one'
    if (this.mediaType !== 'stream' && this.checkIfSongHasStartedSinceAtleastTwoSeconds()) {
      if (this.repeat() === 'all') {
        this.nextSong();
      } else if (this.repeat() === 'one') {
        this.player.currentTime = 0;
        this.player.play();
      }
    } else {
      this.triggerPlay();
    }
  }

  playBtnHandler(): void {
    if (this.loaderDisplay) {
      return;
    }

    if (this.player.paused) {
      this.player.play();
    } else {
      // Store the current time before pausing
      this.currentTime = this.player.currentTime;
      this.player.pause();
    }
  }

  triggerPlay(track?: Track): void {
    if (track) {
      this.startOffset = track.startOffset || 0;
      this.endOffset.set(track.endOffset || 0);
    }

    setTimeout(() => {
      this.player.play();
    }, 50);
  }

  toggleVolume() {
    this.volume = this.volume ? 0 : this.toggledVolume;
    this.player.volume = this.volume;
  }

  toggleRepeat() {
    if (this.repeat() === 'none') {
      this.repeat.set('all');
    } else if (this.repeat() === 'all') {
      if (this.tracks.length > 1) {
        this.repeat.set('one');
      } else {
        this.repeat.set('none');
      }
    } else if (this.repeat() === 'one' && this.tracks.length > 1) {
      this.repeat.set('none');
    }
  }

  private buildDisplayedColumns() {
    this.displayedColumns = ['title'];
    if (this.displayArtist()) {
      this.displayedColumns.push('artist');
    }
    if (this.displayDuration()) {
      this.displayedColumns.push('duration');
    }
    this.displayedColumns.push('status');
  }

  setDataSourceAttributes() {
    let index = 1;
    if (this.tracks) {
      this.tracks.forEach((track: Track) => {
        track.index = index++;
      });
      this.dataSource = new MatTableDataSource<Track>(this.tracks);
      this.dataSource.paginator = this.paginator;
    }
  }

  nextSong(): void {
    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    this.updateCurrentTrack();
    this.nextTrackRequested.emit("NextTrackRequested");
    this.triggerPlay();
  }

  previousSong(): void {
    if (this.player.currentTime > 2) {
      this.player.currentTime = 0;
    } else {
      this.currentIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    }

    this.updateCurrentTrack();
    this.previousTrackRequested.emit("PreviousTrackRequested");
    this.triggerPlay();
  }

  resetSong(): void {
    this.player.src = this.tracks[this.currentIndex].link;
  }

  selectTrack(index: number): void {
    this.currentIndex = index - 1;
    this.updateCurrentTrack();

    this.trackSelected.emit("TrackSelected");
    this.triggerPlay();
  }

  updateCurrentTrack() {    
    this.audioplayerService.currentTrack.set((this.tracks[this.currentIndex]));
  }

  checkIfSongHasStartedSinceAtleastTwoSeconds(): boolean {
    return this.player.currentTime > 2;
  }

  updateSlider(event: any) {
    this.currentTime = event.target.value; // Update UI as user drags
  }

  seekTo(time: number) {
    // Prevent seeking if audio isn't ready
    if (!this.player || !this.player.duration) {
      return;
    }

    // Ensure time is within valid bounds
    const validTime = Math.max(0, Math.min(time, this.player.duration));

    // Update audio element time
    this.player.currentTime = validTime;
    
    // Update component state
    this.currentTime = validTime;
  }
}
