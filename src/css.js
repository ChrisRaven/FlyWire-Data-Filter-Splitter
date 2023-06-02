function addCSS() {
  Dock.addCss(/*css*/`
    button.kk-disabled-button {
      background-color: gray !important;
      cursor: default !important;
      color: #ccc !important; 
    }

    button.kk-disabled-button:hover {
      box-shadow: none !important;
    }

    #kk-filtering-settings textarea {
      width: 170px;
      height: 100px;
      margin-top: 10px;
    }

    #kk-filtering-settings textarea::placeholder {
      color: #444;
    }

    .kk-filtering-header {
      font-size: 16px;
      color: #888;
      margin: 35px 0 0 20px;
      letter-spacing: 1.5px;
    }

    #kk-filtering-header-preload {
      display: inline-block;
    }

    #kk-filtering-counters-wrapper {
      display: inline-block;
      width: 65%;
      text-align: right;
      color: orange;
      cursor: default;
    }

    #kk-filtering-settings {
      position: absolute;
      width: 370px;
      height: 460px;
      top: 73px;
      left: 5px;
      background-color: rgba(40, 40, 40, 0.9);
      z-index: 30;
      font-family: arial, sans-serif;
      font-size: 12px;
    }

    .kk-filtering-button-group {
      margin: 10px 10px 10px 5px;
    }

    .kk-filtering-button-group span {
      display: inline-block;
      width: 50px;
    }

    #kk-filtering-settings button {
      width: 70px;
      height: 20px;
      background-color: #5454d3;
      color: white;
      border-radius: 4px;
      box-shadow: 0 0 0.2em #5454d3;
      border: none;
      margin-right: 2px;
      cursor: pointer;
    }

    #kk-filtering-settings button:hover {
      box-shadow: 0 0 0.5em #5454d3;
    }

    button#kk-filtering-copy {
      background-color: #31b560;
    }

    button#kk-filtering-copy:hover {
      box-shadow: 0 0 0.5em #51d07d;
    }

    button#kk-filtering-clear {
      background-color: #ef3166;
    }

    button#kk-filtering-clear:hover {
      box-shadow: 0 0 0.5em #f15480;
    }

    #kk-filtering-planes {
      display: inline-block;
      margin: 20px 0 0 10px;
    }

    #kk-filtering-planes button {
      width: 20px;
    }

    #kk-filtering-planes span {
      display: inline-block;
      margin-right: 10px;
    }

    #kk-filtering-settings-button-wrapper {
      display: inline-block;
      position: relative;
      width: 50%;
      text-align: right;
    }

    .filtering-border-line {
      position: absolute;
      width: 0;
      height: 100vh;
      border: 1px solid white;
      left: 0;
      z-index: 10;
    }

    .kk-filtering-sliders-group {
      margin: 10px 10px 10px 5px;
    }

    .kk-filtering-slider-container {
      display: grid;
      grid-template-columns: 0.1fr 0.86fr;
      align-items: center;
      justify-content: space-between;
    }

    #kk-filtering-set-filters {
      cursor: pointer;
      user-select: none;
      margin-top: 10px;
      padding: 0 10px;
      font-size: 14px;
      color: orange;
    }

    #min-preload {
      left: 10px;
      border-color: red;
    }

    #max-preload {
      left: 40px;
      border-color: #4aa3ff;
    }

    #min-postload {
      left: 10px;
      border-color: yellow;
    }

    #max-postload {
      left: 40px;
      border-color: #77ff77;
    }
  `)
}