import { Component, effect, ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AudioPlayerComponent, Track } from '../../../../projects/audio-player/src/public-api';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent, MatCheckboxModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  private fmaBaseUrl = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music';

  @ViewChild('player', { static: false })
  advancedPlayer: AudioPlayerComponent;

  events: string[] = [];
  trackEvents: Track[] = [];

  // Stream - set duration to 0 for streams.
  stream: Track[] = [
    {
      title: 'Audio Stream',
      // link: `http://mediaserv33.live-streams.nl:8036/live`,
      link: 'http://mediaserv30.live-streams.nl:8086/live',
      // link: 'https://mediaserv30.live-streams.nl:2199/tunein/-stream/hionline.pls',
      mediaType: 'stream',
      artist: 'Assorted'
    },
  ];

  // Single
  singleTrack: Track[] = [
    {
      title: 'In Love',
      link:
        'https://dl.dropboxusercontent.com/s/9v0psowra7ekhxo/A%20Himitsu%20-%20In%20Love%20%28feat.%20Nori%29.flac?dl=0',
      duration: 227,
      artist: 'A Himitsu feat. Nori'
    }
  ];

  // Multiple
  multiple: Track[] = [
    {
      title: 'In Love',
      link:
        'https://dl.dropboxusercontent.com/s/9v0psowra7ekhxo/A%20Himitsu%20-%20In%20Love%20%28feat.%20Nori%29.flac?dl=0',
      duration: 227,
      artist: 'A Himitsu feat. Nori'
    },
    {
      title: 'On & On (feat. Daniel Levi) [NCS Release]',
      link:
        'https://dl.dropboxusercontent.com/s/w99exjxnwoqwz0e/Cartoon-on-on-feat-daniel-levi-ncs-release.mp3?dl=0',
      duration: 208,
      artist: 'Cartoon'
    },
    {
      title: '1400',
      link: `${this.fmaBaseUrl}/no_curator/Yung_Kartz/August_2018/Yung_Kartz_-_10_-_1400.mp3`,
      duration: 212,
      artist: 'Yung Kartz'
    },
    {
      title: 'Epic Song',
      link: `${this.fmaBaseUrl}/ccCommunity/BoxCat_Games/Nameless_The_Hackers_RPG_Soundtrack/BoxCat_Games_-_10_-_Epic_Song.mp3`,
      duration: 54,
      artist: 'BoxCat Games'
    }
  ];

  msaapPlaylist: Track[] = this.multiple;

  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  pageSizeOptions = [5, 10];

  msaapDisplayVolumeControls = true;
  msaapDisplayVolumeSlider = true;
  msaapDisplayRepeatControls = true;
  msaapDisplayArtist = false;
  msaapDisplayDuration = false;
  msaapDisablePositionSlider = false;

  msaapTableHeader = 'My Playlist';
  msaapTitleHeader = 'My Title';
  msaapArtistHeader = 'My Artist';
  msaapDurationHeader = 'My Duration';


  // Start: Required for demo purpose

  msaapPlaylist2: Track[] = [
    {
      title: 'Hachiko (The Faithful Dog)',
      link: `${this.fmaBaseUrl}/ccCommunity/The_Kyoto_Connection/Wake_Up/The_Kyoto_Connection_-_09_-_Hachiko_The_Faithtful_Dog.mp3`,
      duration: 185,
      artist: 'The Kyoto'
    },
    {
      title: 'Starling',
      link: `${this.fmaBaseUrl}/Music_for_Video/Podington_Bear/Solo_Instruments/Podington_Bear_-_Starling.mp3`,
      duration: 105,
      artist: 'Podington Bear'
    }
  ];

  currentTrack: Track;
  currentTime: any;

  appendTracksToPlaylistDisable = false;
  counter = 1;

  constructor() {
    effect(() => {
      this.currentTrack = this.advancedPlayer.audioplayerService.currentTrack();
    });

    effect(() => {
      this.currentTime = this.advancedPlayer.audioplayerService.currentTime();
    });
  }

  onEnded(event: any) {
    this.addEvent(event);
    // your logic which needs to
    // be triggered once the
    // track ends goes here.

    // example
    this.currentTrack = {} as Track;
  }

  addEvent(event: any) {
    this.events.push(event);    
    this.trackEvents.push(this.currentTrack)
  }

  onNextTrackRequested(event: any) {
    this.addEvent(event);
  }

  onPreviousTrackRequested(event: any) {
    this.addEvent(event);
  }

  onTrackPlaying(event: any) {    
    this.addEvent(event);
  }

  onTrackPaused(event: any) {
    this.addEvent(event);
  }

  onTrackSelected(event: any) {  
    setTimeout(() => {
      this.addEvent(event);
    }, 30);
  }

  consoleLogCurrentData() {
    // logCurrentTrack();
    // logCurrentTime();
    // Make sure to subscribe (by calling above methods)
    // before getting the data
    console.log(this.currentTrack.title + ' : ' + this.currentTime);
  }

  appendTracksToPlaylist() {

    if (this.msaapPlaylist.length === 1) {
      this.msaapPlaylist = this.multiple;
    } else if (this.msaapPlaylist.length === 4) {
      this.msaapPlaylist2.map(track => {
        this.msaapPlaylist.push(track);
      });
      this.advancedPlayer.audioplayerService.playlist.set(this.msaapPlaylist);
      this.appendTracksToPlaylistDisable = true;
    }
  }

  setStream() {
    this.msaapPlaylist = this.stream;
    this.appendTracksToPlaylistDisable = false;
    this.msaapDisplayRepeatControls = false;
  }

  setSingleTrack() {
    this.msaapPlaylist = this.singleTrack;
    this.appendTracksToPlaylistDisable = false;
  }

  changeMsaapDisplayTitle(event: any) {
    this.msaapDisplayTitle = event.checked;
  }

  changeMsaapDisplayPlayList(event: any) {
    this.msaapDisplayPlayList = event.checked;
  }

  changeMsaapDisplayVolumeControls(event: any) {
    this.msaapDisplayVolumeControls = event.checked;
  }

  changeMsaapDisplayRepeatControls(event: any) {
    this.msaapDisplayRepeatControls = event.checked;
  }

  changeMsaapDisplayVolumeSlider(event: any) {
    this.msaapDisplayVolumeSlider = event.checked;
  }

  changeMsaapDisplayArtist(event: any) {
    this.msaapDisplayArtist = event.checked;
  }

  changeMsaapDisplayDuration(event: any) {
    this.msaapDisplayDuration = event.checked;
  }

  changeMsaapDisablePositionSlider(event: any) {
    this.msaapDisablePositionSlider = event.checked;
  }
  // End: Required for demo purpose

  play() {
    this.advancedPlayer.play();
  }

  pause() {
    this.advancedPlayer.pause();
  }

  stop() {
    this.advancedPlayer.stop();
  }

  clearEvents() {
    this.events = [];
    this.trackEvents = [];
  }

  logCurrentTrack() {
    console.log(this.advancedPlayer.audioplayerService.currentTrack());
  }

  logCurrentTime() {
    console.log(this.advancedPlayer.audioplayerService.currentTime());
  }
}
