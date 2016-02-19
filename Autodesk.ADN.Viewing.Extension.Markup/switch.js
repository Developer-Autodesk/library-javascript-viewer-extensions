var switchCss = `

   .onoffswitch {
      position: relative; width: 66px;
      -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
    }

    .onoffswitch-checkbox {
        display: none;
    }

    .onoffswitch-label {
        display: block; overflow: hidden; cursor: pointer;
        border: 2px solid #999999; border-radius: 20px;
    }

    .onoffswitch-inner {
        display: block; width: 200%; margin-left: -100%;
        transition: margin 0.3s ease-in 0s;
    }

    .onoffswitch-inner:before, .onoffswitch-inner:after {
        display: block; float: left; width: 50%; height: 23px; padding: 0; line-height: 23px;
        font-size: 11px;
        color: white;
        font-family: Trebuchet, Arial, sans-serif;
        font-weight: bold;
        box-sizing: border-box;
    }

    .onoffswitch-inner:before {
        content: "EDIT";
        padding-left: 10px;
        background-color: #42C542;
        color: #FFFFFF;
    }

    .onoffswitch-inner:after {
        content: " VIEW";
        padding-right: 10px;
        background-color: #EEEEEE; color: #999999;
        text-align: right;
    }

    .onoffswitch-switch {
        display: block; width: 18px; margin: 2.5px;
        background: #FFFFFF;
        position: absolute; top: 0; bottom: 0;
        right: 39px;
        border: 2px solid #999999; border-radius: 20px;
        transition: all 0.3s ease-in 0s;
    }

    .onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
        margin-left: 0;
    }

    .onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
        right: 0px;
    }

  `;

$('<style type="text/css">' + switchCss + '</style>').appendTo('head');

/////////////////////////////////////////////////////////////////
// Generates random guid to use as DOM id
//
/////////////////////////////////////////////////////////////////
function guid() {

  var d = new Date().getTime();

  var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

  return guid;
}

/////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////
function createSwitchButton(parent, checked, onChanged) {

  var inputId = guid();

  var labelId = guid();

  var html = [
    '<div class="onoffswitch">',
    '<input id="' + inputId + '" type="checkbox" name="onoffswitch"',
    'class="onoffswitch-checkbox" ' + (checked ? "checked" : "") + '>',
    '<label id="' + labelId + '" class="onoffswitch-label" for="myonoffswitch">',
    '<span class="onoffswitch-inner"></span>',
    '<span class="onoffswitch-switch"></span>',
    '</label>',
    '</div>'
  ];

  $(parent).append(html.join('\n'));

  $('#' + labelId).click(function(e){

    var input = $('#' + inputId)[0];

    input.checked = !input.checked;

    onChanged(input.checked);
  });
}