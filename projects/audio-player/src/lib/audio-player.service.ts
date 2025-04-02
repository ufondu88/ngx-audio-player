import { Injectable, signal } from "@angular/core";
import { Track } from "./model/track.model";

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService { 
  currentTrack = signal<Track>({} as Track);
  playlist = signal<Track[]>([]);
  currentTime = signal<number>(0);
}