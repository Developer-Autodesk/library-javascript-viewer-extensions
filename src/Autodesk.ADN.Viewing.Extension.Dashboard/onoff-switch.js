
//https://proto.io/freebies/onoff/

var onoffSwitchCss = `

  .onoffswitch {
    position: relative; width: 50px;
    -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
  }
  .onoffswitch-checkbox {
    display: none;
  }
  .onoffswitch-label {
    display: block; overflow: hidden; cursor: pointer;
    border: 2px solid #999999; border-radius: 8px;
  }
  .onoffswitch-inner {
    display: block; width: 200%; margin-left: -100%;
    transition: margin 0.3s ease-in 0s;
  }
  .onoffswitch-inner:before, .onoffswitch-inner:after {
    display: block; float: left; width: 50%; height: 15px; padding: 0; line-height: 15px;
    font-size: 10px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;
    box-sizing: border-box;
  }
  .onoffswitch-inner:before {
    content: "ON";
    padding-left: 10px;
    background-color: #16DE16; color: #FFFFFF;
  }
  .onoffswitch-inner:after {
    content: "OFF";
    padding-right: 10px;
    background-color: #E82525; color: #FFFFFF;
    text-align: right;
  }
  .onoffswitch-switch {
    display: block; width: 11px; margin: 2px;
    background: #FFFFFF;
    position: absolute; top: 0; bottom: 0;
    right: 31px;
    border: 2px solid #999999; border-radius: 8px;
    transition: all 0.3s ease-in 0s;
  }
  .onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
    margin-left: 0;
  }
  .onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
    right: 0px;
  }

  `;

$('<style type="text/css">' + onoffSwitchCss + '</style>').appendTo('head');
