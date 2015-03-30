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
}
function getSurveys(date){
  $('#webserviceMsg').html(date); 
  $.ajax({data:{
    date:date
  },url:"http://altolago.nimbo.pro/syncsurveys"}).success(function(res){
    if(res.synced=='false'){
      var db = openDatabase('mydb', '1.0', 'ALTOLAGO DB', 2 * 1024 * 1024);
      db.transaction(function (tx) {  
        tx.executeSql('DROP TABLE Surveys');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Surveys (id unique, name, description,active)');
      });

      db.transaction(function (tx) {  
        for(n in res.surveys){
          tx.executeSql('INSERT INTO Surveys (id, name,description,active) VALUES (?,?,?,?)',[res.surveys[n].id,res.surveys[n].name,res.surveys[n].description,res.surveys[n].active]);
        }
      });

      db.transaction(function (tx) {  
        tx.executeSql('DROP TABLE SurveyStructure');
        tx.executeSql('CREATE TABLE IF NOT EXISTS SurveyStructure (id unique, id_survey,id_kind, values, order,group)');
      });

      db.transaction(function (tx) {  
        for(n in res.survey_structure){
          tx.executeSql('INSERT INTO SurveyStructure (id, id_survey,id_kind, values, order,group) VALUES (?,?,?,?,?,?)',[res.survey_structure[n].id,res.survey_structure[n].id_survey,res.survey_structure[n].id_kind,res.survey_structure[n].values,res.survey_structure[n].order,res.survey_structure[n].group]);
        }
        if(!surveysW)writeSurveys();
      });


      db.transaction(function (tx) {  
        tx.executeSql('UPDATE Sync SET synced_at=? WHERE name = ?',[res.sync.synced_at,'Surveys']);
      });

    }else{
      if(!surveysW)writeSurveys();
    }

  });
}

function syncSurvey(){
  $('#webserviceMsg').html('Sync'); 
  surveysSync=true;
  var db = openDatabase('mydb', '1.0', 'ALTOLAGO DB', 2 * 1024 * 1024);
  db.transaction(function (tx) {  
    tx.executeSql('CREATE TABLE IF NOT EXISTS Sync (id unique, name, synced_at)');
    tx.executeSql('INSERT INTO Sync (id, name,synced_at) VALUES (1,"Surveys","2000-01-01 00:00:00")');
  });
  db.transaction(function (tx) {  
    tx.executeSql('SELECT * FROM Sync WHERE name = ?',['Surveys'],function(tx,results){
      date=(results.rows.item(0).synced_at);
      getSurveys(date);
    });
  });
}

function writeSurveys(){
  surveysW=true;
  var db = openDatabase('mydb', '1.0', 'ALTOLAGO DB', 2 * 1024 * 1024);
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM Surveys WHERE active=1', [], function (tx, results) {
     var len = results.rows.length, i;
     $('#encuestas').html('');
     for (i = 0; i < len; i++){
       $('#encuestas').append('<a href="encuesta.html#'+results.rows.item(i).id+'"><button class="txtBtn"><div class="shadow"></div><div class="active"><table><tr><td>'+results.rows.item(i).name+'</td></tr></table></div></button></a>');
     }
     animateTxtBtn();
   }, null);
 });
}






$(function() {
  $('#refresh').on('click',function(){
    //localStorage.removeItem("deviceName");
    var db = openDatabase('mydb', '1.0', 'ALTOLAGO DB', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('DROP TABLE Sync');
    });
    location.reload();
  })
  if (localStorage.getItem("deviceName") === null) {
    $('#webserviceMsg').html('registrado');
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
  },
  onDeviceOnline: function() {
    if(!surveysSync) syncSurvey();
  },
  onDeviceOffline: function() {
    if(!surveysW)writeSurveys();
  }
}
