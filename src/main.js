javascript:(function(){
  var keys = ["st_time_1","st_time_2","st_time_3","st_time_4","st_time_5"];
  var currentKeyIndex = "st_active_preset" || "0";
  
  if(document.getElementById("st-dock")) return;
  
  var d = document.createElement("div");
  d.id = "st-dock";
  d.title = "Sleep Timer";
  Object.assign(d.style,{
    position:"fixed",
    top:"10px",
    right:"10px",
    backgroundColor:"rgba(0,0,0,0.85)",
    color:"#fff",
    padding:"10px",
    borderRadius:"6px",
    zIndex:"999999",
    fontFamily:"sans-serif",
    fontSize:"14px",
    boxShadow:"0 2px 10px rgba(0,0,0,0.3)",
    display:"flex",
    alignItems:"center",
    gap:"8px"
  });
  document.body.appendChild(d);
  
  var timerId = null;

  function showInput(){
    if(timerId){
      clearTimeout(timerId);
      timerId = null;
    }
    
    var activeIdx = localStorage.getItem("st_active_idx") || "0";
    
    var selectHtml = '<select id="st-select" style="font-size:12px;padding:3px;border-radius:3px;background:#fff;color:#000;">';
    for(var i=0; i<keys.length; i++){
      var defaultVal = (i === 0 ? "23:30" : (i === 1 ? "00:00" : (i === 2 ? "01:00" : (i === 3 ? "02:00" : "06:00"))));
      var t = localStorage.getItem(keys[i]) || defaultVal;
      selectHtml += '<option value="'+i+'"'+(i.toString() === activeIdx ? ' selected' : '')+'>#'+(i+1)+' ('+t+')</option>';
    }
    selectHtml += '</select>';
    
    var saved = localStorage.getItem(keys[activeIdx]) || "23:30";
    
    d.innerHTML = selectHtml +
      '<input type="time" id="st-time" value="'+saved+'" style="font-size:14px;padding:3px;border:none;border-radius:3px;width:80px;background:#fff;color:#000;">' +
      '<button id="st-start" style="background:#007bff;color:#fff;border:none;padding:4px 10px;border-radius:3px;cursor:pointer;font-size:12px;">Start</button>';
    
    var sel = document.getElementById("st-select");
    var timeInput = document.getElementById("st-time");
    
    sel.onchange = function(){
      localStorage.setItem("st_active_idx", sel.value);
      var val = localStorage.getItem(keys[sel.value]) || (sel.value === "0" ? "23:30" : "00:00");
      timeInput.value = val;
    };
    
    timeInput.onchange = function(){
      var idx = sel.value;
      localStorage.setItem(keys[idx], timeInput.value);
      // セレクトボックスの表示も更新
      sel.options[idx].text = '#' + (parseInt(idx)+1) + ' (' + timeInput.value + ')';
    };

    document.getElementById("st-start").onclick = function(){
      var idx = sel.value;
      var val = timeInput.value;
      if(!val) return;
      localStorage.setItem("st_active_idx", idx);
      localStorage.setItem(keys[idx], val);
      startTimer(val);
    };
  }

  function startTimer(timeStr){
    var match = timeStr.match(/^(\d{2}):(\d{2})$/);
    if(!match) return;
    var h = parseInt(match[1],10);
    var m = parseInt(match[2],10);
    var target = new Date();
    target.setHours(h,m,0,0);
    if(target <= new Date()){
      target.setDate(target.getDate()+1);
    }
    
    function update(){
      var diff = target - new Date();
      if(diff <= 0){
        d.remove();
        location.href = "about:blank";
        return;
      }
      var remainMin = Math.ceil(diff/60000);
      d.innerHTML = '<span style="font-weight:bold;">⏳ ' + remainMin + ' min left</span> <span style="font-size:11px;color:#ccc;">('+timeStr+')</span><button id="st-stop" style="background:#dc3545;color:#fff;border:none;padding:3px 8px;border-radius:3px;cursor:pointer;font-size:11px;">Change</button>';
      document.getElementById("st-stop").onclick = showInput;
      timerId = setTimeout(update, 60000 - ((new Date()) % 60000));
    }
    update();
  }

  showInput();
})();
