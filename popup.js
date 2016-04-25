
var RESET_TEXT = 'reset';
var BANNED_SITES = 'BANNED_SITES';

var create_elem = function(type) {
  return document.createElement(type);
};
var create_with_attrs = function(type, attrs) {
  var elem = create_elem(type);
  for (var k in attrs) {
    //console.log(k + " " + attrs[k]);
    elem.setAttribute(k, attrs[k]);
  }
  return elem;
};

var get_remove_btn = function(tr, site) {
  var list = document.querySelector('#list');
  var remove = create_with_attrs("img", {
    "src": "cross.svg",
    "class": "remove",
    "draggable": "false",
  });
  remove.onmousedown = function () {
    remove.setAttribute("class", "remove pressed");
  }
  remove.onclick = function () {
    chrome.storage.sync.get(BANNED_SITES, function(response) {
      var ind = response[BANNED_SITES].indexOf(site);
      response[BANNED_SITES].splice(ind, 1);
      chrome.storage.sync.set(response);
    });
    list.removeChild(tr);
  }
  remove.onmouseup = function () {
    remove.setAttribute("class", "remove");
  }
  remove.onmouseout = function () {
    remove.setAttribute("class", "remove");
  }
  remove.onmouseover = function () {
    if (remove.down === "true") {
      remove.setAttribute("class", "remove pressed");
    }
  }
  return remove;
}

var refresh_list = function () {
  var list = document.querySelector('#list');
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  chrome.storage.sync.get(BANNED_SITES, function(response) {
    response[BANNED_SITES].forEach(function(site, ind, arr) {
      var tr = create_elem("tr");
      var td = create_elem("td");
      var favicon = create_with_attrs("img", {
        "src": "http://www.google.com/s2/favicons?domain=" + site,
        "class": "favicon"
      });
      td.appendChild(favicon);
      tr.appendChild(td);
      td = create_elem("td");
      td.appendChild(document.createTextNode(site));
      tr.appendChild(td);
      td = create_elem("td");

      td.appendChild(get_remove_btn(tr, site));
      tr.appendChild(td);
      list.appendChild(tr);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  refresh_list();
  var button = document.querySelector('#'+RESET_TEXT);
  button.onclick = function() {
    chrome.runtime.sendMessage(RESET_TEXT);
    refresh_list();
    console.log('Storage Reset');
  };
  var button = document.querySelector('#new');
  button.onclick = function() {
    if (document.getElementById("new-site") != null) {
      return;
    }
    var tr = create_with_attrs("tr", {"id": "new-row"});
    var td = create_elem("td");
    var favicon = create_with_attrs("img", {
      "src": "http://www.google.com/s2/favicons",
      "class": "favicon",
    });
    td.appendChild(favicon);
    tr.appendChild(td);
    td = create_elem("td");
    var defualt_text = "Enter new site (\"example.com\")";
    var input = create_with_attrs("input", {
      "type": "text",
      "id": "new-site",
      "value": defualt_text
    });
    input.onfocus = function() {
      input.setAttribute("value", "");
    };
/*    input.onblur = function() {
      if (input.value === "") {
        input.setAttribute("value", defualt_text);
      }
    }
*/
    check_and_add = function () {
      var txt = document.getElementById("new-site");
      var row = document.getElementById("new-row");
      var site_to_add = txt.value;
      if (site_to_add !== "" && site_to_add !== defualt_text) {
        chrome.storage.sync.get(BANNED_SITES, function(response) {
          // if already in banned sites
          if (response[BANNED_SITES].indexOf(site_to_add) > -1) {
            return;
          }
          row.setAttribute("id", "");
          var img = row.children[0].children[0]
          img.setAttribute("src", "http://www.google.com/s2/favicons?domain=" + site_to_add);
          var td = row.children[1];
          td.removeChild(td.firstChild);
          td.appendChild(document.createTextNode(site_to_add));
          row.children[2].appendChild(get_remove_btn(row, site_to_add))
          response[BANNED_SITES] = response[BANNED_SITES].concat(site_to_add);
          chrome.storage.sync.set(response);
        });
      }
    };
    input.onblur = check_and_add;
    td.appendChild(input);
    tr.appendChild(td);
    tr.appendChild(create_elem("td"));
    list.appendChild(tr);
  };
});

