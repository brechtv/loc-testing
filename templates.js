var intro_card_template = `
      <div id="place_card" class="place_card mdl-card mdl-card-wide clear_content">
      <div class="mdl-card__title">
        <h2 class="mdl-card__title-text">Click the map to get started</h2>
      </div>
      <div class="mdl-card__supporting-text">
       <p>Stuff</p>
      </div>
    </div>`

var header_card_template = `
      <div class="header_card mdl-card mdl-card-wide mdl-shadow--2dp" id="header_card">
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">{{ title }}</h2>
        </div>
        <div class="mdl-card__supporting-text">
          <p>{{ subtitle }}</p>
          <p>{{ content }}</p>
        </div>
        <div class="mdl-card__actions mdl-card--border">
          <a class="mdl-button mdl-button--colored mdl-button-rounded mdl-js-button mdl-js-ripple-effect" id="start">{{ button_url }}
          </a>
        </div>
        <div class="mdl-card__menu">
        </div>
      </div>`

var place_card_template = `
      <div id="place_card" class="place_card mdl-card mdl-card-wide clear_content">
      <div class="mdl-card__title">
        <h2 class="mdl-card__title-text">{{ title }}</h2>
      </div>
      <div class="mdl-card__supporting-text" id="distance_duration">
      </div>
      <div class="mdl-card__supporting-text">
       <p>{{ subtitle }}</p>
      </div>
      <div class="mdl-card__menu">
            <button id="resize" class="bigmap" onclick="resize();">
                <i class="material-icons">expand_less</i>
            </button>
      </div>
    </div>`
