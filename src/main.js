javascript:(function(){
  var keys = ["st_t1","st_t2","st_t3","st_t4","st_t5"];
  var modeKeys = ["st_m1","st_m2","st_m3","st_m4","st_m5"];
  
  if(document.getElementById("st-dock")) return;
  
  var d = document.createElement("div");
  d.id = "st-dock";
  d.title = "Sleep Timer";
  Object.assign(d.style,{
    position:"fixed", top:"10px", right:"10px",
    backgroundColor:"rgba(0,0,0,0.85)", color:"#fff",
    padding:"10px", borderRadius:"6px", zIndex:"999999",
    fontFamily:"sans-serif", fontSize:"14px",
    boxShadow:"0 2px 10px rgba(0,0,0,0.3)",
    display:"flex", alignItems:"center", gap:"8px"
  });
  document.body.appendChild(d);
  
  var timerId = null;

  function showInput(){
    if(timerId){ clearTimeout(timerId); timerId = null; }
    
    var activeIdx = localStorage.getItem("st_active_idx") || "0";
    var currentMode = localStorage.getItem(modeKeys[activeIdx]) || "time";
    
    // Preset select
    var selectHtml = '<select id="st-select" title="Select Preset" style="font-size:12px;padding:3px;border-radius:3px;background:#fff;color:#000;">';
    for(var i=0; i<keys.length; i++){
      var mode = localStorage.getItem(modeKeys[i]) || "time";
      var defVal = (mode === "time" ? "23:30" : "30");
      var t = localStorage.getItem(keys[i]) || defVal;
      var label = (mode === "time" ? t : t + "m");
      selectHtml += '<option value="'+i+'"'+(i.toString() === activeIdx ? ' selected' : '')+'>#'+(i+1)+' ('+label+')</option>';
    }
    selectHtml += '</select>';
    
    // Mode select
    var modeTooltip = (currentMode === "time" ? "Mode: Target Time (Absolute)" : "Mode: Duration (Countdown)");
    var modeHtml = '<select id="st-mode" title="'+modeTooltip+'" style="font-size:12px;padding:3px;border-radius:3px;background:#fff;color:#000;">' +
      '<option value="time"'+(currentMode==="time"?' selected':'')+'>🎯 Target</option>' +
      '<option value="duration"'+(currentMode==="duration"?' selected':'')+'>⏱️ Duration</option>' +
    '</select>';
    
    var savedVal = localStorage.getItem(keys[activeIdx]) || (currentMode === "time" ? "23:30" : "30");
    
    // Picker (共通のid="st-val"に統一)
    var pickerHtml = '';
    if(currentMode === "time"){
      pickerHtml = '<input type="time" id="st-val" title="Target Time" value="'+savedVal+'" style="font-size:14px;padding:3px;border:none;border-radius:3px;width:80px;background:#fff;color:#000;">';
    } else {
      pickerHtml = '<input type="number" id="st-val" min="1" max="1440" title="Minutes from now" value="'+savedVal+'" placeholder="min" style="font-size:14px;padding:3px;border:none;border-radius:3px;width:50px;background:#fff;color:#000;"> <span style="font-size:12px;" title="Minutes from now">m</span>';
    }
    
    d.innerHTML = selectHtml + modeHtml + pickerHtml +
      '<button id="st-start" title="Start Timer" style="background:#007bff;color:#fff;border:none;padding:4px 10px;border-radius:3px;cursor:pointer;font-size:12px;">Start</button>';
    
    var sel = document.getElementById("st-select");
    var modeSel = document.getElementById("st-mode");
    
    sel.onchange = function(){
      localStorage.setItem("st_active_idx", sel.value);
      showInput();
    };
    
    modeSel.onchange = function(){
      var idx = sel.value;
      var newMode = modeSel.value;
      localStorage.setItem(modeKeys[idx], newMode);
      var defaultVal = (newMode === "time" ? "23:30" : "30");
      localStorage.setItem(keys[idx], defaultVal);
      showInput();
    };

    document.getElementById("st-start").onclick = function(){
      var idx = sel.value;
      var mode = modeSel.value;
      var val = document.getElementById("st-val").value;
      if(!val) return;
      
      localStorage.setItem("st_active_idx", idx);
      localStorage.setItem(modeKeys[idx], mode);
      localStorage.setItem(keys[idx], val);
      
      startTimer(mode, val);
    };
  }

  function startTimer(mode, val){
    var target = new Date();
    
    if(mode === "time"){
      var match = val.match(/^(\d{2}):(\d{2})$/);
      if(!match) return;
      target.setHours(parseInt(match[1],10), parseInt(match[2],10), 0, 0);
      if(target <= new Date()){
        target.setDate(target.getDate()+1);
      }
    } else {
      var minutes = parseInt(val, 10);
      if(isNaN(minutes) || minutes <= 0) return;
      target.setTime(target.getTime() + minutes * 60000);
    }
    
    function update(){
      var diff = target - new Date();
      if(diff <= 0){
        d.remove();
        location.href = "about:blank";
        return;
      }
      var remainMin = Math.ceil(diff/60000);
      var displayLabel = (mode === "time" ? val : val + "m");
      
      d.innerHTML = '<span style="font-weight:bold;" title="Remaining time">⏳ ' + remainMin + ' min left</span> <span style="font-size:11px;color:#ccc;" title="Preset value">('+displayLabel+')</span><button id="st-stop" title="Change settings" style="background:#dc3545;color:#fff;border:none;padding:3px 8px;border-radius:3px;cursor:pointer;font-size:11px;">Change</button>';
      document.getElementById("st-stop").onclick = showInput;
      timerId = setTimeout(update, 60000 - ((new Date()) % 60000));
    }
    update();
  }

  showInput();
})();
