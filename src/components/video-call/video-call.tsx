import { Component, Element, Prop, State } from '@stencil/core';
import { MatchResults, RouterHistory } from '@stencil/router';
import { ToastController, Toast } from '@ionic/core';

declare const SimpleWebRTC: any;

@Component({
  tag: 'video-call',
  styleUrl: 'video-call.scss',
  scoped: true
})
export class VideoCall {

  @State() muted: boolean;

  @Prop() match: MatchResults;
  @Prop() history: RouterHistory;
  @Prop({ connect: 'ion-toast-controller' }) toastCtrl: ToastController;

  @Element() el: Element;

  webrtc: any;

  componentDidLoad() {
    console.log('room', this.match.params.room);

    this.webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: this.el.querySelector('#local'),
      // the id/element dom element that will hold remote videos
      remoteVideosEl: "",
      // immediately ask for camera access
      autoRequestMedia: true
    });

    this.doCall();
  }

  connectionFailure(local: boolean) {
    if (local) {
      this.toastCtrl.create({
        message: 'Local Connection failure...',
        duration: 1500
      }).then((toast: Toast) => {
        toast.present();
      })
    } else {
      this.toastCtrl.create({
        message: 'Remote Connection failure...',
        duration: 1500
      }).then((toast: Toast) => {
        toast.present();
      })
    }
  }

  connectionHandler(peer) {
    peer.pc.on("iceConnectionStateChange", (event: RTCIceConnectionState) => {
      switch (peer.pc.iceConnectionState) {
        case "disconnected":
        case "closed":
          console.log("disconnected");
          this.history.replace('/', {});
          break;
      }
    });
  }

  listeners() {
    this.webrtc.on("iceFailed", () => {
      this.connectionFailure(true);
    });
    this.webrtc.on("connectivityError", () => {
      this.connectionFailure(false);
    });
  }

  doCall() {
    this.webrtc.joinRoom(this.match.params.room);

    this.webrtc.on('videoAdded', (video, peer) => {
      console.log("video added", peer);
      (this.el.querySelector('#remote') as HTMLVideoElement).srcObject = peer.stream;

      this.connectionHandler(peer);

    })
  }

  muteHandler() {
    console.log(this.muted);
    if (this.muted) {
      this.webrtc.unmute();
      this.muted = false;
    } else {
      this.webrtc.mute();
      this.muted = true;
    }
  }

  disconnect() {
    this.webrtc.disconnect();
    this.history.replace('/', {});
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: document.title,
        text: 'Join my call',
        url: window.location.href
      });
    }
  }

  render() {
    return (
      <ion-page class='show-page'>
        <ion-content>
          <video autoplay id="local"></video>

          <video autoplay id="remote"></video>

          <div id='actions'>
            {this.muted ? <ion-button color='primary' class='unmute' fill='clear' onClick={() => this.muteHandler()}>Unmute</ion-button> :
              <ion-button class='mute' color='danger' fill='clear' onClick={() => this.muteHandler()}>Mute</ion-button>}

            <ion-button id='disconnect' color='danger' onClick={() => this.disconnect()}>End Call</ion-button>

            <ion-button fill='clear' id='share' color='primary' onClick={() => this.share()}>Invite</ion-button>
          </div>
        </ion-content>
      </ion-page>
    );
  }
}
