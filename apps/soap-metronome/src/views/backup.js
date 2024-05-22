header {
  height: 40px;
  line-height: 40px;
  background-color: var(--sw-light-background-color);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

header > div {
  display: flex;
}

sc-text {
  width: 200px;
  height: 30px;
  font-size: 11px;

  font-size: var(--sc-font-size);
  font-family: var(--sc-font-family);

} 

section .clocks .world sc-clock {
  width: 200px;
  height: 30px;
  font-size: 11px;
}

section .clocks .movie sc-clock {
  /*width: 500px;
  height: 70px;*/
  width: 100%;
  height: 50%;
  font-size: 35px;
}

section .clocks .movie sc-button {
  /*width: 500px;
  height: 70px;*/
  width: 100%;
  height: 50%;
  font-size: 35px;
}

section .measure sc-button {
/*  width: 500px;
  height: 70px;*/
  width: 50%;
  height: 12%;
  font-size: 35px;
}

section .bar sc-button {
  width: 50%;
  height: 12%;
  font-size: 15px;
}

section .musictimes .flashs sc-flash {
  float: inline-end;
  fill: var(--sc-color-primary-1);
  width: 18%;
  height: 150px;
  margin-right: 1%;

}



<div class="advanced-options">
        <!-- @TODO - fix me

        <h3>MTC</h3>
        <div>
          <div style="padding-bottom: 3px;">
            <sc-text>active MTC Receive</sc-text>
            <sc-toggle
              @change=${(e) => e.detail.value ? app.createMTCReceive() : app.deleteMTCReceive()}
              ?active=${(app.mtcReceive === null) ? false : true}
              ?disabled=${app.mtcSend}
            ></sc-toggle>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>active MTC Send</sc-text>
            <sc-toggle
              @change=${(e) => e.detail.value ? app.createMTCSend() : app.deleteMTCSend()}
              ?active=${(app.mtcSend === null) ? false : true}
              ?disabled=${app.mtcReceive}
            ></sc-toggle>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>input device</sc-text>
            <sc-select
              @change=${e => app.model.mtcParams.inputInterface = e.target.value}
              .options=${Object.keys(app.model.midiDeviceList.inputs)}
              value=${app.model.mtcParams.inputInterface}
              ?disabled=${app.mtcSend || app.mtcReceive}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>output device</sc-text>
            <sc-select
              .options=${Object.keys(app.model.midiDeviceList.outputs)}
              value=${app.model.mtcParams.outputInterface}
              ?disabled=${app.mtcSend || app.mtcReceive}
              @change=${e => app.model.mtcParams.outputInterface = e.target.value}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>mtc framerate</sc-text>
            <sc-select
              .options=${[24, 25, 30]}
              value=${app.model.mtcParams.framerate}
              ?disabled=${app.mtcSend || app.mtcReceive}
              @change=${e => app.model.mtcParams.framerate = e.detail.value}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>max drift error in frame</sc-text>
            <sc-number
              min="0"
              value=${app.model.mtcParams.maxDriftError}
              @input=${e => app.model.mtcParams.maxDriftError = parseInt(Math.max(e.target.value,0))}
              ?disabled=${app.mtcSend || app.mtcReceive}
            ></sc-number>
        </div>
        -->

        <h3>Import</h3>
      </div>
    ` : nothing}


    <!-- main screen -->
    <section>
      <!-- top row -->

      <div class="progress-bar">
      <!-- @todo - fixme -->
      ${app.soapEngine.current && app.soapEngine.current.event.duration
        ? html `
          <sc-progress-bar
            .getProgressFunction=${app.getPositionInAbsoluteEvent}
            min="0"
            max="${app.soapEngine.current && app.soapEngine.current.event.duration ? app.soapEngine.current.event.duration : 1}"
            displayNumber
          ></sc-progress-bar>`
        : html`
        `
      }
      </div>
      <div class="clocks">
        <div style="padding-bottom: 3px;">
          <div class="world">
            <sc-clock format="hh:mm"></sc-clock>
          </div>
        </div>
        <div style="padding-bottom: 1%;">
          <div class="movie">
            <sc-clock
              .getTimeFunction=${app.getTransportPosition}
              twinkle
              format="hh:mm:ss:ms"
            ></sc-clock>
            <sc-button style="height: 60px;"> 
              ${app.soapEngine.current && app.soapEngine.current.event ? app.soapEngine.current.event.label : ''}
            </sc-button>
          </div>
        </div>
      </div> 
      <div class="musictimes" 
        <div style="padding-bottom: 3px;">
          <div style="padding-right: 53px;">
            <div class="flashs";>
              <sc-flash
                duration="0.15"
                color="brown"
                .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat !== 1 : false)}"
              ></sc-flash>
              <div style="margin-bottom: 22px;">
                <sc-flash
                  duration="0.15"
                  color="limegreen"
                  .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat === 1 : false)}"
                ></sc-flash>
              </div>
            </div>  
          </div>
          <div class="measure">
            <sc-button>
              Measure ${app.soapEngine.bar} 
            </sc-button>
          </div> 
          <div class="bar">
            <sc-button>
              Bar ${app.soapEngine.beat}  
            </sc-button>

            <sc-button
                value="Tempo: 
                  ${app.soapEngine.current
                    ? `${app.soapEngine.current.event.tempo.basis.upper} / ${app.soapEngine.current.event.tempo.basis.lower} = ${app.soapEngine.current.event.tempo.bpm}` 
                    : ''}"
            ></sc-button>
          </div> 
        </div>
      </div>  

      <!-- bottom row -->
      <div class="controls">
        <div class="col-1">
          <div class="transport-control">
            <div style="margin-bottom: 20px;">
            <sc-button>
              ${app.soapEngine.current.event.signature.upper}
            </sc-button>
            <sc-button>
              ${app.soapEngine.current.event.signature.lower}
            </sc-button>
              <sc-transport
                ?disabled=${app.mtcReceive}
                .buttons=${['play', 'stop']}
                state="${app.getTransportState()}"
                @change=${e => app.setTransportState(e.detail.value)}
              ></sc-transport>
            </div>
          </div>
        </div>
        <div class="dragndrop">
          <sc-dragndrop
            style="margin-bottom: 4px;"
            format="load"
            @change=${e => app.setScore(e.detail.value[Object.keys(e.detail.value)[0]])}
          >drag'n'drop SO(a)P</sc-dragndrop>
          <sc-dragndrop
            style="margin-bottom: 4px;"
            @change=${e => app.parseMidi(e.detail.value[Object.keys(e.detail.value)[0]])}
          >drag'n'drop MIDI</sc-dragndrop>
        </div>
      </div>
    </section>