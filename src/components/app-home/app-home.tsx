import { Component, Element, State } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  scoped: true
})
export class AppHome {

  @State() roomName: string;

  @Element() el: Element;

  componentDidLoad() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream: MediaStream) => {
      const video = this.el.querySelector('video');
      video.srcObject = stream;
    })
  }

  handleChange(event: Event) {
    this.roomName = (event.target as HTMLInputElement).value;
  }

  render() {
    return (
      <ion-page class='show-page'>
        <ion-content>
          <div id='mainBlock'>
            <video id='mainVideo' autoplay></video>

            <div id='inputBlock'>
              <input type='text' placeholder='Room name' value={this.roomName} onInput={(ev) => this.handleChange(ev)}></input>

              <stencil-route-link url={`/video/${this.roomName}`} custom={true}>
                <ion-button color='dark' expand='block'>Join Call</ion-button>
              </stencil-route-link>
            </div>
          </div>
        </ion-content>
      </ion-page>
    );
  }
}
