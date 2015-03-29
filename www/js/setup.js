var deviceNameTmp;
var surveysW,surveysSync=false;
function animateTxtBtn(){
  $('.txtBtn').delay(500).each(function(i) {
    $(this).addClass("undone").delay(200*i).queue(function(){
      $(this).addClass("show").dequeue().delay(1000).queue(function(){
        $(this).addClass("done").dequeue();
      });
    });
  });
/*$('.txtBtn').delay(500).each(function(i) {
  $(this).addClass("undone").delay(200*i).queue(function(){
    $(this).addClass("bounce").dequeue().delay(1000).queue(function(){
      $(this).addClass("done").dequeue();
    });
  });
});*/
}
function startReg(){
  navigator.notification.prompt(
        'Ingresa un nombre para este dispositivo',  // message
        onPrompt,                  // callback to invoke
        'Registro de dispositivo',            // title
        ['Ok'],             // buttonLabels
        ''                 // defaultText
        );
}
function alertDismissed(){

}
function onConfirm(buttonIndex){
  if(buttonIndex==1){
    $.ajax({data:{
      name:deviceNameTmp,
      model:device.model,
      plataform:device.platform,
      uuid:device.uuid,
      version:device.version
    },url:"http://altolago.nimbo.pro/register"}).success(function(res){
      $('#webserviceMsg').html(res);
      localStorage.setItem("deviceName", res);
      location.reload();
    });

    /*$.post("http://altolago.nimbo.pro/register",{
      name:deviceNameTmp,
      model:device.model,
      plataform:device.platform,
      uuid:device.uuid,
      version:device.version
    },function(){
      if(e=='ok'){
        localStorage.setItem("deviceName", deviceNameTmp);
        app.initialize();

      }else{
        alert('error');
      }
    });*/
}else{
  startReg();
}

}
function onPrompt(results) {
  deviceNameTmp=results.input1;
  if(results.input1==''){
    navigator.notification.alert(
            'Es necesario registrar el dispositivo con un nombre valido',  // message
            startReg,         // callback
            'Registro incorrecto',            // title
            'Ok'                  // buttonName
            );
  }else{
    navigator.notification.confirm(
        'El dispositivo se registara con el nombre: '+deviceNameTmp, // message
         onConfirm,            // callback to invoke with index of button pressed
        'Registro de dispositivo',           // title
        ['Ok','Cancelar']         // buttonLabels
        );
  }
    /*navigator.notification.alert(
            'You are the winner!',  // message
            alertDismissed,         // callback
            'Game Over',            // title
            'Done'                  // buttonName
            );*/

 // alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
}
function getSurveys(date){
  $.ajax({url:"http://altolago.nimbo.pro/syncsurveys",data:{date:date}}).success(function(res){
    alert('date: '+res);
    surveysSync=true;
  });
}

function syncSurvey(){
  var db = openDatabase('mydb', '1.0', 'ALTOLAGO DB', 2 * 1024 * 1024);
  db.transaction(function (tx) {  
    tx.executeSql('CREATE TABLE IF NOT EXISTS Sync (id unique, name, synced_at)');
    tx.executeSql('SELECT * FROM Sync WHERE name = ?',['Surveys'],function(tx,results){
      var len = results.rows.length, i;
      var date='2000-01-01 00:00:00';
      if(len!=0){
        date=(results.rows.item(0).synced_at);
      }
      $('#webserviceMsg').append(date);
      getSurveys(date);
    });
  });
}

function writeSurveys(){
  surveysW=true;
  var db = openDatabase('mydb', '1.0', 'ALTOLAGO DB', 2 * 1024 * 1024);
  db.transaction(function (tx) {  
   tx.executeSql('CREATE TABLE IF NOT EXISTS Encuestas (id unique, name)');
   tx.executeSql('INSERT INTO Encuestas (id, name) VALUES (1, "default")');
 });
  db.transaction(function (tx) {
   tx.executeSql('SELECT * FROM Encuestas', [], function (tx, results) {
     var len = results.rows.length, i;
     $('#encuestas').html('');
     for (i = 0; i < len; i++){

       $('#encuestas').append('<a href="encuesta.html"><button class="txtBtn"><div class="shadow"></div><div class="active"><table><tr><td>'+results.rows.item(i).name+'</td></tr></table></div></button></a>');

     }
     animateTxtBtn();
   }, null);
 });
}






$(function() {
  $('#refresh').on('click',function(){
    localStorage.removeItem("deviceName");
    location.reload();
  })
  if (localStorage.getItem("deviceName") === null) {
    register.initialize();
  }else{
    app.initialize();
  }

});

var register={
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener("online", this.onDeviceOnline, false);
    document.addEventListener("offline", this.onDeviceOffline, false);
  },
  onDeviceOnline: function() {

    startReg();
  },
  onDeviceOffline: function() {
    navigator.notification.alert(
            'El dispositivo no ha sido registrado, \nrevisa tu conexión a internet para poder realizar el registro',  // message
            null,         // callback
            'Sin conexión',            // title
            'Ok'                  // buttonName
            );
  }
}


var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener("online", this.onDeviceOnline, false);
    document.addEventListener("offline", this.onDeviceOffline, false);
  },
  onDeviceReady: function() {
    var element = document.getElementById('deviceProperties');
    element.innerHTML = 'Device Model: '     + device.model     + '<br />' +
    'Device Cordova: '  + device.cordova  + '<br />' +
    'Device Platform: ' + device.platform + '<br />' +
    'Device UUID: '     + device.uuid     + '<br />' +
    'Device Version: '     + device.version     + '<br />' +
    'Device Name: '  + localStorage.getItem("deviceName")  + '<br />';
    //alert('deviceready');
  },
  onDeviceOnline: function() {
    if(!surveysSync) syncSurvey();
   // if(!surveysW)writeSurveys();
   /* $.ajax({url:"http://altolago.nimbo.pro/surveys"}).success(function(res){
      $('#webserviceMsg').html(res);
      
    });*/
  },
  onDeviceOffline: function() {
    $('#webserviceMsg').html(offline);
  }
}

/*
document.addEventListener("deviceready", onDeviceReady, false);

    // device APIs are available
    //
    function onDeviceReady() {
        var element = document.getElementById('deviceProperties');
        element.innerHTML = 'Device Name: '     + device.name     + '<br />' +
                            'Device Model: '    + device.model    + '<br />' +
                            'Device Cordova: '  + device.cordova  + '<br />' +
                            'Device Platform: ' + device.platform + '<br />' +
                            'Device UUID: '     + device.uuid     + '<br />' +
                            'Device Version: '  + device.version  + '<br />';
    }
    */