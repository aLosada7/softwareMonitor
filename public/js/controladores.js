angular.module("app", ["ngRoute","ngCookies"])
    .factory("userPersistenceService", ["$cookies", function($cookies) {
        var datosUsuario = "";

        return {
          setCookieData: function(data) {
            datosUsuario = data;
            $cookies.put("datosUsuario", data);
          },
          getCookieData: function() {
            datosUsuario = $cookies.get("datosUsuario");
            return datosUsuario;
          },
          clearCookieData: function() {
            datosUsuario = "";
            $cookies.remove("datosUsuario");
          }
        }
      }
    ])
    .directive('ngFiles', ['$parse', function ($parse) {

            function fn_link(scope, element, attrs) {
                var onChange = $parse(attrs.ngFiles);
                element.on('change', function (event) {
                    onChange(scope, { $files: event.target.files });
                });
            };

            return {
                link: fn_link
            }
        } 
    ])
    .config(function($routeProvider){
        $routeProvider
            .when("/", {
                controller: "ctrlAcceso",
                controllerAs: "vm",
                templateUrl: "principal"
            })
            .when("/principalUsuario", {
                controller: "ctrlPrinUsuario",
                controllerAs: "vm",
                templateUrl: "principalUsuario"
            })
            .when("/monitorizacion", {
                controller: "ctrlMonitor",
                controllerAs: "vm",
                templateUrl: "monitorizacion"
            })
            .when("/despliegue", {
                controller: "ctrlDespliegue",
                controllerAs: "vm",
                templateUrl: "despliegue"
            })
            
    })
    .controller('ctrlAcceso',function($scope,$cookies,$log,$http){
      //Navegador
      $('#navRegistrado').hide();
      $('#navNoRegistrado').show();
      $('#panelLoginMal').hide();

      //Usuario
      $scope.usuario={
          id:"",
          nombre:"",
          apellidos:"",
          email:"",
          password:"",
      };



      //Resultado Login y resultado Registro
      $scope.resultLogin=""; $scope.resultRegistro="";

      $scope.userInfo = {"email":"","password":""};

      //LOGIN
      $scope.comprobarLogin=function(userInfo){

      $scope.datosBusqueda=[];
      $scope.datosBusqueda[0]=userInfo.usuario;
      $scope.datosBusqueda[1]=userInfo.password;


        var url='/loginJira/'+$scope.datosBusqueda;
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
            $scope.respuestaLogin=response.data.Result;
            if(response.data.Result.active == true){

              var usuario=userInfo.usuario;
              var url='/checkLogin/'+usuario;

              $http({
                  method: 'GET',
                  url: url
              })
              .then(function(response) {
                if(response.data.Result.length>0){
                  $scope.usuario = response.data.Result; 
                  $cookies.put("user", userInfo.usuario);
                  $cookies.put("con", userInfo.password);
                  window.location.replace('#!/principalUsuario');
                  
                }else{
                  console.log("Usuario no registrado");
                  $scope.registrar(userInfo,$scope.respuestaLogin);
                }
               //$scope.usuario = response.data.Result;

              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });



            }else{
              console.log("Incorrecto");
              $('#panelLoginMal').show();
            }
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });


      }

      //REGISTRO
      $scope.registrar=function(userInfo,respuestaLogin){
        //Comprobaciones datos correctos
        //comprobar que lleva una arroba y que no hay ningun usuario registrado con este email

        //preguntar si meter condicion


        var datos=$scope.respuestaLogin;
        var url='/registro/';
              $http({
                  method: 'POST',
                  url: url,
                  data: datos
              })
              .then(function(response) {
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
              $cookies.put("user", userInfo.usuario);
              $cookies.put("con", userInfo.password);
                window.location.replace('#!/principalUsuario');

      }


    })
    .controller('ctrlPrinUsuario',function($scope,$cookies,$log,$http){
        $('#navNoRegistrado').hide();
        $('#navRegistrado').show();
        $('#resumenVersion').hide();

        //Usuario
        $scope.datosUsuario={
          id:"",
          usuario:"",
          nombre:"",
          apellidos:"",
          email:""
        };

        //muestro versiones creadas por el usuario
        $scope.versiones = [{
          id:"",
          keynombre:"",
          nombre: "",
          keyproyecto:"",
          proyecto: "",
          consulta:"",
          propietario:"",
          excluirtareas: "",
          porcompletado: "",
          urljira: "",
          tareapruebas:"",
        }];

        $scope.usuario=$cookies.get("user");
        var url='/checkUsuario/'+$scope.usuario;
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
            $scope.datosUsuario = response.data.Result; //guardar versiones de un usuario
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });      
        $("#siVersionSeleccionada").hide();


        //Petición versiones del usuario a Node
        var url='/checkVersiones/'+$scope.usuario;
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
            $scope.versiones = response.data.Result; //guardar versiones de un usuario
            for (var i = 0; i < $scope.versiones.length; i++) {
              if($scope.versiones[i].tareapruebas == null){
                $scope.versiones[i].tareapruebas="No seleccionada";
              }
            }


            //console.log($scope.versiones);
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });

        //Si seleccionas una versión y cambioa

        $scope.myFunction=function(elem){
          $("#noVersionSeleccionada").hide(500);
          $("#siVersionSeleccionada").hide(500);
          
          $scope.both=elem;

          var url='/checkDespl/';
            $http({
                method: 'GET',
                url: url
            })
            .then(function(response) {
                $scope.desplegados = response.data.Result;
                $scope.desplegado="No";
                for (var i=0; i < $scope.desplegados.length; i++) {
                  if ($scope.desplegados[i].keynombre.trim() == $scope.both.keynombre.trim()  && $scope.both.keyproyecto) {
                    $scope.desplegado="Sí";
                  }
                }
                
              
            })
            .catch(function(response) {
              console.error('Gists error', response.status, response.data);
            });
          if($scope.both.porcompletado === 100){
            $("#enProgresoResumen").hide();
            $("#pendienteResumen").hide();
            $("#acabadoResumen").show();
          }else if($scope.both.porcompletado === 0){
            $("#enProgresoResumen").hide();
            $("#acabadoResumen").hide();
            $("#pendienteResumen").show();
          }else{
            $("#pendienteResumen").hide();
            $("#acabadoResumen").hide();
            $("#enProgresoResumen").show();
          }
          $("#siVersionSeleccionada").show(1000);
          $('#theprogressbar').attr('aria-valuenow', $scope.both.porcompletado+"%").css('width',$scope.both.porcompletado+"%");
          $('#resumenVersion').show();
        }
        
      
    })
    .controller('ctrlMonitor',function($scope,$cookies,$log,$http){
      $('#navNoRegistrado').hide();
      $('#navRegistrado').show();
      $("#siVersionSeleccionada").hide();
      $("#enVersionSeleccionada").hide();

      //Usuario
      $scope.datosUsuario={
          "id":"",
          "usuario":"",
          "nombre":"",
          "apellidos":"",
          "email":""
      };

      //versiones del usuario
      $scope.versiones = [{
        id:"",
        keynombre:"",
        nombre: "",
        keyproyecto:"",
        proyecto: "",
        consulta:"",
        propietario:"",
        excluirtareas: "",
        porcompletado: "",
        urljira: "",
        tareapruebas:""
      }];



        $scope.usuario=$cookies.get("user");
        var url='/checkUsuario/'+$scope.usuario;
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
            $scope.datosUsuario = response.data.Result; //guardar versiones de un usuario
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });     
      

      //Petición versiones del usuario a Node
      var url='/checkVersiones/'+$scope.usuario;
      $http({
          method: 'GET',
          url: url
      })
      .then(function(response) {
          $scope.versiones = response.data.Result; //guardar versiones de un usuario
        
      })
      .catch(function(response) {
        console.error('Gists error', response.status, response.data);
      });

       
      //JS Nueva versión
      $(document).ready(function(){
        $("#nuevaVer").click(function(){
              $("#primeraNuevaVersion").show();
              $("#ultimaNuevaVersion").hide();
              $("#actualizarVersion").hide();
              $("#abrirCerrarZona1").hide();
              $("#abrirCerrarZona2").hide();
          });
          $("#siguientePaso").click(function(){
            $("#actualizarVersion").hide();
          $("#primeraNuevaVersion").hide();
          $("#ultimaNuevaVersion").show();
          $("#noTrabajandoConsultaMal").hide();
          $("#noTrabajandoConsultaBien").hide();
          $("#trabajandoConsulta").show();

          
             //si la consulta jira esta vacia no deja aceptar
          });
          $("#guardarVersionNueva").click(function(){
            $("#primeraNuevaVersion").hide();
            $("#ultimaNuevaVersion").hide();
            $('#myModal').modal('hide');
          });

          $("#anteriorPaso").click(function(){
          $("#ultimaNuevaVersion").hide();
          $("#primeraNuevaVersion").show();
             
          });
          $("#abrirCerrar1").click(function(){
            $("#abrirCerrarZona1").show();
             
          });
          $("#abrirCerrar2").click(function(){
            $("#abrirCerrarZona2").show();
             
          });
      });



      $scope.nuevaVersion=function(verInfo) {
       
        $scope.verInfo.resultado="Espera.... estamos trabajando en la consulta";
        var nombreVersion=""; var nombreProyecto="";
        

          var n = $scope.verInfo.filtro.search("project");
          console.log(n);
          var m = $scope.verInfo.filtro.search("fixVersion");
          console.log(m);
          if( n ==-1 || m == -1){
            $scope.verInfo.resultado="No ha sido posible completar la solicitud. Los datos introducidos no coinciden con ninguna de las versiones existentes. Vuelve a intentarlo.";
            document.getElementById("guardarVersionNueva").disabled = true;
            $("#trabajandoConsulta").hide();
            $('#resultado').css('background-color','#B31111');
            $("#noTrabajandoConsultaMal").show();
            $("#noTrabajandoConsultaBien").hide();
          }else{
            $scope.datosBusqueda=[];
            $scope.datosBusqueda[0]=$scope.verInfo.filtro.trim();
            $scope.datosBusqueda[1]=$cookies.get("user").trim();
            $scope.datosBusqueda[2]=$cookies.get("con").trim();
            var url='/buscarJira/'+$scope.datosBusqueda;
            $http({
                method: 'GET',
                url: url
            })
            .then(function(response) {
              var sinTareas=0;
             if(response.data.Result.issues.length == 0){
                sinTareas=1;
             }
             if(sinTareas==0){
                  for (var i = 0; i < response.data.Result.issues[0].fields.fixVersions.length; i++) {
                    var nombre =$scope.verInfo.filtro.search(response.data.Result.issues[0].fields.fixVersions[i].name.trim());
                    if(nombre != -1){
                        $scope.verInfo.nombre=response.data.Result.issues[0].fields.fixVersions[i].name.trim();
                        $scope.verInfo.keyNombre=response.data.Result.issues[0].fields.fixVersions[i].id.trim();
                    }
                  }
                  
                  
                  $scope.verInfo.proyecto=response.data.Result.issues[0].fields.project.name;
                  $scope.verInfo.keyProyecto=response.data.Result.issues[0].fields.project.key;
                  $scope.verInfo.url="https://jira.indra.es/browse/"+$scope.verInfo.keyProyecto+"/fixforversion/"+$scope.verInfo.keyNombre+"/";
                  $("#trabajandoConsulta").hide();
                  var existe=0;
                  console.log($cookies.get("user").trim());
                  for (var i = 0; i < $scope.versiones.length; i++) {
                    console.log($scope.versiones[i].keynombre + " " + $scope.versiones[i].keyproyecto+ " " + $scope.versiones[i].propietario);
                    if ($scope.verInfo.keyNombre.trim() == $scope.versiones[i].keynombre.trim() && $scope.verInfo.keyProyecto.trim() == $scope.versiones[i].keyproyecto.trim() && $cookies.get("user").trim()==$scope.versiones[i].propietario.trim()) {
                      existe=1;
                    }
                  }

                  if(existe == 1){
                    $scope.verInfo.resultado="Lo sentimos. Ya has monitorizado esta versión.";
                      document.getElementById("guardarVersionNueva").disabled = true;
                      $('#resultado').css('background-color','#B31111');
                      $("#noTrabajandoConsultaMal").show();
                      $("#noTrabajandoConsultaBien").hide();
                  }else if($scope.verInfo.keyProyecto !=null && $scope.verInfo.keyNombre !=null ){
                    $scope.verInfo.resultado="Este es el resultado de la consulta con los datos que nos has ofrecido.";
                    $('#resultado').css('background-color','green');
                    document.getElementById("guardarVersionNueva").disabled = false;
                    $("#noTrabajandoConsultaBien").show();
                    $("#noTrabajandoConsultaMal").hide();
                  }else{
                    $scope.verInfo.resultado="No ha sido posible completar la solicitud. Los datos introducidos no coinciden con ninguna de las versiones existentes. Vuelve a intentarlo.";
                    document.getElementById("guardarVersionNueva").disabled = true;
                    $('#resultado').css('background-color','#B31111');
                    $("#noTrabajandoConsultaMal").show();
                    $("#noTrabajandoConsultaBien").hide();
                  }
              }else{
                $scope.verInfo.resultado="Esta versión no puede ser monitorizada porque no tiene tareas. Vuelve a intentarlo.";
                document.getElementById("guardarVersionNueva").disabled = true;
                $('#resultado').css('background-color','#B31111');
                $("#noTrabajandoConsultaMal").show();
                $("#trabajandoConsulta").hide();
                $("#noTrabajandoConsultaBien").hide();
              }
            })
            .catch(function(response) {
              console.error('Gists error', response.status, response.data);
            });
          }
      }

      $scope.guardarNuevaVersion=function(verInfo){
        $scope.verInfo.propietario=$cookies.get("user");


        $scope.despl = [{
        id:"",
        nombre:"",
        keynombre:"",
        proyecto:"",
        keyproyecto:"",
        desplegada:""
      }];

        //comprobar si otro ha monitorizado ya esta version y tiene pruebas.
        $scope.buscarVersionesMonitorizadas=[];
        $scope.buscarVersionesMonitorizadas[0]=$scope.verInfo.keyNombre;
        $scope.buscarVersionesMonitorizadas[1]=$scope.verInfo.keyProyecto;

        var url='/checkDespl/';

        $http({
          method: 'GET',
          url: url
        })
        .then(function(response) {
            $scope.despl = response.data.Result; //guardar versiones de un usuario
            var cont=0;
            console.log($scope.despl);
            for (var i = 0; i < $scope.despl.length; i++) {
              if($scope.despl[i].keynombre.trim() == $scope.verInfo.keyNombre && $scope.despl[i].keyproyecto.trim() == $scope.verInfo.keyProyecto){
                cont=1;
                break;
              }
            }
            console.log(cont);
            if(cont==0){

              var datos=$scope.verInfo;
              var url='/nuevoDespl/';
              $http({
                  method: 'POST',
                  url: url,
                  data: datos
              })
              .then(function(response) {

                  })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
            }
            
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });


         var url='/checkVersionesAnteriores/'+$scope.buscarVersionesMonitorizadas;

          $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
          if(response.data.Result.length >0){
            $scope.verAnteriores = response.data.Result;
            if($scope.verAnteriores[0].tareapruebas != null){
              $scope.verInfo.tareapruebas=$scope.verAnteriores[0].tareapruebas.trim();
            }else{
              $scope.verInfo.tareapruebas="";
            }
            var datos=$scope.verInfo;
        var url='/nuevaVersion/';
        $http({
            method: 'POST',
            url: url,
            data: datos
        })
        .then(function(response) {

          if($scope.verInfo.tareapruebas.length>0){
            $scope.datos ={
            tarea:"",
            keynombre:"",
            keyproyecto:""
          }
          $scope.datos.tarea=$scope.verInfo.tareapruebas;
          $scope.datos.keynombre=$scope.verInfo.keyNombre;
          $scope.datos.keyproyecto=$scope.verInfo.keyProyecto;
          // UPDATE public.versiones SET excluirtareas='hola' WHERE id=8;
          var datos=$scope.datos;
          var url='/modificarTareaPruebas/';
          $http({
            method: 'POST',
            url: url,
            data:datos
        })
        .then(function(response) {
            console.log("listo");
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });
          }


          var url='/checkVersiones/'+$cookies.get("user");
      $http({
          method: 'GET',
          url: url
      })
      .then(function(response) {
          $scope.versiones = response.data.Result; //guardar versiones de un usuario
          for(var i=0;i<$scope.versiones.length;i++){
            if($scope.versiones[i].urljira.trim() === $scope.verInfo.url){
                $scope.versionSelec=$scope.versiones[i].id;
                $scope.actualizarMonitorizador();
                break;
            }
          }
          
        
      })
      .catch(function(response) {
        console.error('Gists error', response.status, response.data);
      });

        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });
          }else{
            $scope.verInfo.tareapruebas=null;
            var datos=$scope.verInfo;
        var url='/nuevaVersion/';
        $http({
            method: 'POST',
            url: url,
            data: datos
        })
        .then(function(response) {
          console.log("Nueva versión registrada");
          var url='/checkVersiones/'+$cookies.get("user");
      $http({
          method: 'GET',
          url: url
      })
      .then(function(response) {
          $scope.versiones = response.data.Result; //guardar versiones de un usuario
          for(var i=0;i<$scope.versiones.length;i++){
            if($scope.versiones[i].urljira.trim() === $scope.verInfo.url){
                $scope.versionSelec=$scope.versiones[i].id;
                $scope.actualizarMonitorizador();
                break;
            }
          }
          
        
      })
      .catch(function(response) {
        console.error('Gists error', response.status, response.data);
      });

        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });
          }
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        }); 


      }

       $scope.versMonit = {
        id:"",
        keynombre:"",
        nombre: "",
        keyproyecto:"",
        proyecto: "",
        consulta:"",
        propietario:"",
        excluirtareas: "",
        porcompletado: "",
        urljira: ""
      };
      $scope.tareasExcluidas="";


      $scope.actualizarMonitorizador=function(){
        if($scope.versionSelec!=null){
          document.getElementById("nuevaVer").disabled = true;
          document.getElementById("seleccionarVersion").disabled = true;
        }
         var hoy = new Date();
          var fecha = hoy.getDate() + '/' + ( hoy.getMonth() + 1 ) + '/' + hoy.getFullYear();

          var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
          var rest= (hora).split(":");
          hora=""
          for(var i=0;i<rest.length;i++){
            if(rest[i]<10){
              rest[i]="0"+rest[i];
            }
            if(i!=2)hora=hora+rest[i]+":";
            else{hora=hora+rest[i]}
          }
          var fechaYHora = fecha + ' ' + hora;
          
          $scope.actualizado="Actualizado a: "+fechaYHora;

        if($scope.versionSelec != null){
            $("#noVersionSeleccionada").hide(500);
            $("#enVersionSeleccionada").show(500);
            $("#siVersionSeleccionada").hide(500);
          }
        $scope.versMonit="";
        for (x=0;x<$scope.versiones.length;x++){
            if($scope.versiones[x].id == $scope.versionSelec){
              $scope.versMonit=$scope.versiones[x];
            }
        }
        if($scope.versMonit.nombre != null){
        $scope.datosBusqueda=[];
        $scope.datosBusqueda[0]=$scope.versMonit.consulta.trim();
        $scope.datosBusqueda[1]=$cookies.get("user").trim();
        $scope.datosBusqueda[2]=$cookies.get("con").trim();
        var url='/buscarJira/'+$scope.datosBusqueda;
        
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
          $scope.jiraVersMonit=response.data.Result.issues;
          for (var i = 0; i < $scope.jiraVersMonit.length; i++) {
            if($scope.jiraVersMonit[i].fields.status!=null){
              if ($scope.jiraVersMonit[i].fields.status.name == "Closed") {
                $scope.jiraVersMonit[i].fields.status.name="Cerrada";
              }
              else if ($scope.jiraVersMonit[i].fields.status.name == "Resolved") {
                $scope.jiraVersMonit[i].fields.status.name="Resuelta";
              }
              else if ($scope.jiraVersMonit[i].fields.status.name == "New") {
                $scope.jiraVersMonit[i].fields.status.name="Nueva";
              }
              else if ($scope.jiraVersMonit[i].fields.status.name == "Working on it") {
                $scope.jiraVersMonit[i].fields.status.name="Activa";
              }
              else if ($scope.jiraVersMonit[i].fields.status.name == "Delivered") {
                $scope.jiraVersMonit[i].fields.status.name="Entregada";
              }else{
                $scope.jiraVersMonit[i].fields.status.name="Otro";
              }
            }else{
              }
            
          }
          if($scope.versionSelec != null){
            $("#enVersionSeleccionada").hide(500);
            $("#siVersionSeleccionada").show(500);
          }
          //Excluir tareas

          if($scope.tareasExcluidas!=""){
            $scope.versMonit.excluirtareas=$scope.tareasExcluidas;
          }
          
        
          var exclusion= ($scope.versMonit.excluirtareas).split(",");
          $scope.checkboxExcluidos=exclusion.length-1-1;
          if($scope.checkboxExcluidos < 0){
            $scope.checkboxExcluidos=0;
          }
          
       

          var sumaHorasHechas=0; var sumaHorasTotales=0; var sumaHorasRestantes=0;var porcentajes=0;var media=0;
          var contarCalculo=0;
          $scope.tRealizadas=0;
          $scope.tRestantes=0;

          for (var h = 0; h < $scope.jiraVersMonit.length; h++) {
            contarCalculo=1;
            
            for (var m = 0; m < exclusion.length-1; m++) {
              
              if(exclusion[m].trim()==$scope.jiraVersMonit[h].key.trim()){
                contarCalculo=0;
                $scope.jiraVersMonit[h].ch=false;
                break;
              }
            }
            
            if(contarCalculo==1){
              if($scope.jiraVersMonit[h].fields.aggregateprogress.percent == 100){
                $scope.tRealizadas++;
              }else if($scope.jiraVersMonit[h].fields.aggregateprogress.percent != 100 && $scope.jiraVersMonit[h].fields.aggregateprogress.percent != null){
                $scope.tRestantes++;
              }
              sumaHorasHechas=sumaHorasHechas+($scope.jiraVersMonit[h].fields.aggregatetimespent/3600);
              if(($scope.jiraVersMonit[h].fields.aggregatetimespent/3600) < ($scope.jiraVersMonit[h].fields.timeoriginalestimate/3600) && $scope.jiraVersMonit[h].fields.aggregateprogress.percent != 100){
                sumaHorasRestantes=sumaHorasRestantes+(($scope.jiraVersMonit[h].fields.timeoriginalestimate/3600)-($scope.jiraVersMonit[h].fields.aggregatetimespent/3600))
              }
              sumaHorasTotales=sumaHorasTotales+($scope.jiraVersMonit[h].fields.timeoriginalestimate/3600);
              if($scope.jiraVersMonit[h].fields.aggregateprogress.percent >= 0 && $scope.jiraVersMonit[h].fields.aggregateprogress.percent <= 100){
                porcentajes=porcentajes+$scope.jiraVersMonit[h].fields.aggregateprogress.percent;
                media++;
              }
              $scope.jiraVersMonit[h].ch=true;
            }
          }
          media=porcentajes/media;          
      
          $scope.SHH=sumaHorasHechas;
          $scope.SHR=sumaHorasRestantes;
          $scope.SHT=sumaHorasTotales;
          $scope.media=media;
          $scope.tTotales=$scope.tRealizadas+$scope.tRestantes;
          if($scope.media.toFixed(0)<50){
            $('#circle').attr('class',"progress-circle p"+$scope.media.toFixed(0));
          }else{
            $('#circle').attr('class',"progress-circle p"+$scope.media.toFixed(0)+" over50");
          }
          document.getElementById("nuevaVer").disabled = false;
          document.getElementById("seleccionarVersion").disabled = false;
          //setInterval(function(){ $scope.actualizarMonitorizador(); }, 120000);
          $scope.datos ={
            media:0,
            id:""
          }
          $scope.datos.media=media.toFixed(0);
          $scope.datos.id=$scope.versMonit.id;
          // UPDATE public.versiones SET excluirtareas='hola' WHERE id=8;
          var datos=$scope.datos;
          var url='/modificarPorcCompletado/';
          $http({
              method: 'POST',
              url: url,
              data: datos
          })
          .then(function(response) {
            console.log("Listo.");
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
          
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
      }
      }

      $scope.actualizarVersiones=function(){
        location.reload();

      }

      $scope.borrarVersion=function(){
        
        var seguro=confirm("¿Estas seguro de deja de monitorizar esta versión?");
        if(seguro==true){

          $scope.datos.id=$scope.versMonit.id;
          var datos=$scope.datos;
          var url='/borrarVersion/';
          $http({
              method: 'POST',
              url: url,
              data: datos
          })
          .then(function(response) {
            $scope.console.log("Borrada");
            
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
          location.reload();
        }
      }

      


     $scope.contar=function(){
      $scope.checkboxExcluidos=0;
      $('input[type=checkbox]:not(:checked)').each(function() {
          $scope.checkboxExcluidos++;
        });
      $scope.checkboxExcluidos--;
     }

      $scope.actualizarListaTareas=function(){
        $scope.excluir="";
        
        $('input[type=checkbox]:not(:checked)').each(function() {
          $scope.checkboxExcluidos++;
          if($scope.excluir=="")$scope.excluir=$(this).val()+",";
          else{$scope.excluir=$scope.excluir+$(this).val()+","}
        });
        $scope.datos ={
          excluir:"",
          id:""
        }
        $scope.datos.excluir=$scope.excluir;
        $scope.tareasExcluidas=$scope.excluir;
        $scope.datos.id=$scope.versMonit.id;
        // UPDATE public.versiones SET excluirtareas='hola' WHERE id=8;
        var datos=$scope.datos;
        var url='/modificarTareas/';
        $http({
            method: 'POST',
            url: url,
            data: datos
        })
        .then(function(response) {
          $scope.versionSelec=$scope.versMonit.id;
          console.log($scope.versionSelec);
          $scope.actualizarMonitorizador();
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });
        
      }

    })
.controller('ctrlDespliegue',function($scope,$cookies,$log,$http,$timeout){
        $('#navNoRegistrado').hide();
        $('#navRegistrado').show();
        $('#noVersionSeleccionada').show();
        $('#siVersionSeleccionada').hide();
        $('#noVersionSeleccionada2').show();
        $('#siVersionSeleccionada2').hide();
        $('#mostrarDespliegue').hide();

 
        //Usuario
        $scope.datosUsuario={
          "id":"",
          "usuario":"",
          "nombre":"",
          "apellidos":"",
          "email":""
        };
        $scope.usuario=$cookies.get("user");
        var url='/checkUsuario/'+$scope.usuario;
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
            $scope.datosUsuario = response.data.Result; //guardar versiones de un usuario
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });    

        //versiones del usuario
        $scope.versiones = [{
          id:"",
          keynombre:"",
          nombre: "",
          keyproyecto:"",
          proyecto: "",
          consulta:"",
          propietario:"",
          excluirtareas: "",
          porcompletado: "",
          urljira: "",
          tareapruebas:""
        }];

        $scope.desplieguesTotales={
          "keynombre":"",
          "keyproyecto":"",
          "nombre":"",
          "proyecto":"",
          "desplegada":""
        };

        $scope.despliegues=[{
          "keynombre":"",
          "keyproyecto":"",
          "nombre":"",
          "proyecto":""
        }];

        $scope.despliegues.pop();

        //Petición versiones del usuario a Node
        var url='/checkVersiones/'+$cookies.get("user");
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
            $scope.versiones = response.data.Result; //guardar versiones de un usuario
            var url='/checkDespliegues/';
            $http({
                method: 'GET',
                url: url
            })
            .then(function(response) {
                $scope.desplieguesTotales = response.data.Result; //guardar versiones de un usuario
                  for (var i = 0; i < $scope.desplieguesTotales.length; i++) {
                      for (var j = 0; j < $scope.versiones.length; j++) {
                        if($scope.desplieguesTotales[i].keynombre.trim() == $scope.versiones[j].keynombre.trim() && $scope.desplieguesTotales[i].keyproyecto.trim() == $scope.versiones[j].keyproyecto.trim()){
                          $scope.despliegues.push($scope.desplieguesTotales[i]);
                          break;
                        }
                      }
                    
                  }
                
              
            })
            .catch(function(response) {
              console.error('Gists error', response.status, response.data);
            });
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });


        $scope.desplieguesVersionSeleccionada=[{
            "id":"",
            "nombre":"",
            "keynombre":"",
            "keyproyecto":"",
            "proyecto":"",
            "cliente":"",
            "lugar":"",
            "fotocliente":"",
            "documentos":""
          }];

          $scope.despliegueVersion=[{
            "id":"",
            "nombre":"",
            "keynombre":"",
            "keyproyecto":"",
            "proyecto":"",
            "cliente":"",
            "lugar":"",
            "fotocliente":"",
            "documentos":""
          }];

        $scope.desplVersion=function(it){
          $scope.versDespliegue=it;
            for (var i = 0; i < $scope.versiones.length; i++) {
              if($scope.versiones[i].keynombre.trim()==$scope.versDespliegue.keynombre.trim() && $scope.versiones[i].keyproyecto.trim()==$scope.versDespliegue.keyproyecto.trim()){
                $scope.urljira=$scope.versiones[i].urljira.trim();
              }
            }



          var hoy = new Date();
          var fecha = hoy.getDate() + '/' + ( hoy.getMonth() + 1 ) + '/' + hoy.getFullYear();

          var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
          var rest= (hora).split(":");
          hora=""
          for(var i=0;i<rest.length;i++){
            if(rest[i]<10){
              rest[i]="0"+rest[i];
            }
            if(i!=2)hora=hora+rest[i]+":";
            else{hora=hora+rest[i]}
          }
          var fechaYHora = fecha + ' ' + hora;
          
          $scope.actualizado="Actualizado a: "+fechaYHora;

          
        
        var url='/checkDespliegueVersion/'+$scope.versDespliegue.nombre;
        $http({
            method: 'GET',
            url: url
        })
        .then(function(response) {
          
          $scope.despliegueVersion=response.data.Result;
          var url='/checkDespliegue/'+$scope.versDespliegue.nombre;
          $http({
              method: 'GET',
              url: url
          })
          .then(function(response) {
            
            $scope.desplieguesVersionSeleccionada=response.data.Result;
            $scope.numeroDeDesplieguesTotal=$scope.desplieguesVersionSeleccionada.length;
            var nEquipos=0;
            
            for (var i = 0; i < $scope.despliegueVersion.length; i++) {
              nEquipos=0;
              for (var j = 0; j < $scope.desplieguesVersionSeleccionada.length; j++) {
                if($scope.despliegueVersion[i].lugar.trim() ==  $scope.desplieguesVersionSeleccionada[j].lugar.trim()
                 && $scope.despliegueVersion[i].cliente.trim() ==  $scope.desplieguesVersionSeleccionada[j].cliente.trim()){
                  nEquipos++;
                }
              }
              $scope.despliegueVersion[i].nEquipos=nEquipos;
            }
            
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
          
        })
        .catch(function(response) {
          console.error('Gists error', response.status, response.data);
        });

        

        $scope.incidencias= [{
          "id":"",
          "titulo":"",
          "descripcion":"",
          "enlacetiger":"",
          "keynombre":"",
          "keyproyecto":""
        }];

          var url='/checkIncidencias/'+$scope.versDespliegue.keynombre.trim();
          $http({
              method: 'GET',
              url: url
          })
          .then(function(response) {
            
            $scope.incidencias2=response.data.Result;
            $scope.incidencias.pop();
            for (var i = 0; i < $scope.incidencias2.length; i++) {
              if($scope.incidencias2[i].keyproyecto.trim() == $scope.versDespliegue.keyproyecto.trim()){
                $scope.incidencias.push($scope.incidencias2[i]);
              }

            }

            $scope.numeroDeIncidenciasTotal=$scope.incidencias.length;
            
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
          
          $('#noVersionSeleccionada').hide(500);
          $('#siVersionSeleccionada').hide(500);
          $('#siVersionSeleccionada').show(500);
          $('#noVersionSeleccionada2').hide(500);
          $('#siVersionSeleccionada2').hide(500);
          $('#siVersionSeleccionada2').show(500);
          
        }

        $scope.abrirIncidencias=function(){
          
          $scope.inc.keynombre=$scope.versDespliegue.keynombre.trim();
          $scope.inc.keyproyecto=$scope.versDespliegue.keyproyecto.trim();


          var datos=$scope.inc;
          var url='/nuevaIncidencia/';
          $http({
              method: 'POST',
              url: url,
              data: datos
          })
          .then(function(response) {

              var url='/checkIncidencias/'+$scope.versDespliegue.keynombre.trim();
              $http({
                  method: 'GET',
                  url: url
              })
              .then(function(response) {
                
                $scope.incidencias2=response.data.Result;
                $scope.incidencias.pop();
                for (var i = 0; i < $scope.incidencias2.length; i++) {
                  if($scope.incidencias2[i].keyproyecto.trim() == $scope.versDespliegue.keyproyecto.trim()){

                    $scope.incidencias.push($scope.incidencias2[i]);
                  }

                }
                
                $scope.numeroDeIncidenciasTotal++;
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });

         
        }



        $scope.abrirInfo=function(){
          if($scope.desplieguesVersionSeleccionada.length == 0){
            $('#nuevoCliente').show();
            $('#nuevCl').css('background-color','#D6DCD8');
            $('#clienteExistente').hide();
            $('#clExist').attr('disabled', true);
          }else{
            $('#clExist').css('background-color','#D6DCD8');
            $('#clienteExistente').show();
            $('#nuevoCliente').hide();
          }

          $("#clExist").click(function(){
            if($scope.desplieguesVersionSeleccionada.length == 0){
            $('#nuevoCliente').show();
            $('#nuevCl').css('background-color','#D6DCD8');
            $('#clienteExistente').hide();
            $('#clExist').attr('disabled', true);
          }else{
            $('#clienteExistente').show();
            $('#clExist').css('background-color','#D6DCD8');
            $('#nuevoCliente').hide();
            $('#nuevCl').css('background-color','white');
          }

          });
          $("#nuevCl").click(function(){
            $('#nuevoCliente').show();
            $('#nuevCl').css('background-color','#D6DCD8');
            $('#clienteExistente').hide();
            $('#clExist').css('background-color','white');

          });
          
          var url='/checkClientes/'+$scope.versDespliegue.nombre;
          $http({
              method: 'GET',
              url: url
          })
          .then(function(response) {
            
            $scope.empresasVersion=response.data.Result;
            
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
        }

        $scope.cambioVersDespl=function(){
          $('#mostrarDespliegue').show();
          document.getElementById("botonDesplegar").disabled = false;
          $scope.versEscogida={
          "keynombre":"",
          "nombre":"",
          "porcompletado":""
          };
          var url='/checkVersion/'+$scope.versionSelec;
          $http({
              method: 'GET',
              url: url
          })
          .then(function(response) {
              $scope.versEscogida = response.data.Result; //guardar versiones de un usuario
            
          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
        }
        $scope.nuevoDespliegue=function(nuevoDespliegue){
          $scope.versParaDespliegue={
          "keynombre":"",
          "keyproyecto":"",
          "nombre":"",
          "proyecto":"",
          "urljira":""
          };
          var datos=nuevoDespliegue;
          var url='/nDespliegue/';
          $http({
              method: 'POST',
              url: url,
              data: datos
          })
          .then(function(response) {

          })
          .catch(function(response) {
            console.error('Gists error', response.status, response.data);
          });
          if($scope.versionSelec!=null){
            var url='/checkVersion/'+$scope.versionSelec;
            $http({
                method: 'GET',
                url: url
            })
            .then(function(response) {
                $scope.versParaDespliegue = response.data.Result; //guardar versiones de un usuario
                $scope.despliegues.push($scope.versParaDespliegue[0]);
                $('#nuevoDespliegueModal').modal('hide');
                $scope.desplVersion($scope.versParaDespliegue[0]);
                $scope.versionSelec=null;
              
            })
            .catch(function(response) {
              console.error('Gists error', response.status, response.data);
            });
        }
          
         
          //$scope.despliegues=$scope.despliegues+
        }

        $scope.nVersion=function(){
            document.getElementById("botonDesplegar").disabled = true;

            $scope.versNoDesplegadas = [{
              id:"",
              keynombre:"",
              nombre: "",
              keyproyecto:"",
              proyecto: "",
              consulta:"",
              propietario:"",
              excluirtareas: "",
              porcompletado: "",
              urljira: "",
              tareapruebas:""
            }];

            var esta=0;
            for(var i=0;i<$scope.versiones.length;i++){
              esta=0;
              for(var j=0;j<$scope.despliegues.length;j++){
                if($scope.versiones[i].keynombre.trim() == $scope.despliegues[j].keynombre.trim() && $scope.versiones[i].keyproyecto.trim() == $scope.despliegues[j].keyproyecto.trim()){
                  esta=1;
                }
              }
              if(esta==0){
                
                $scope.versNoDesplegadas.push($scope.versiones[i]);
              }
            }
        }

        $scope.datosRegistro={
            cliente:"",
            lugar:"",
            fotocliente:""
        }

        $scope.verDatosLugarEmpresa=function(despliegueInd){
          $('#agregarDespliegue').hide();
          $("#abrirCerrar3").click(function(){
            $("#agregarDespliegue").show();
             
          });
          $scope.datos={
            cliente:"",
            lugar:"",
            fotocliente:""
          }
          $scope.datos.cliente=despliegueInd.cliente.trim();
          $scope.datos.lugar=despliegueInd.lugar.trim();
          $scope.datos.fotocliente=despliegueInd.fotocliente.trim();
          $scope.datosRegistro=$scope.datos;

          $scope.mostrarDatos=[{
            "id":"",
            "nombre":"",
            "keynombre":"",
            "keyproyecto":"",
            "proyecto":"",
            "cliente":"",
            "lugar":"",
            "fotocliente":"",
            "documentos":"",
            "archivos":""
          }];
          for (var i = 0; i < $scope.desplieguesVersionSeleccionada.length; i++) {
            if($scope.desplieguesVersionSeleccionada[i].cliente.trim()==despliegueInd.cliente.trim()){
              if($scope.desplieguesVersionSeleccionada[i].lugar.trim()==despliegueInd.lugar.trim()){
                $scope.mostrarDatos.push($scope.desplieguesVersionSeleccionada[i]);
              }
            }
          }
          $scope.mostrarDatos.shift();
          $scope.mostrarDatosFinal=[{
            "id":"",
            "nombre":"",
            "keynombre":"",
            "keyproyecto":"",
            "proyecto":"",
            "cliente":"",
            "lugar":"",
            "fotocliente":"",
            "documentos":"",
            "archivos":"",
            "nEquipos":0,
            "nArchivos":0
          }];
          $scope.mostrarDatosFinal.pop();
          var num=0;
          for(var i=0;i<$scope.mostrarDatos.length;i++){
            num=0;
            for(var j=0;j<$scope.mostrarDatosFinal.length;j++){
              if($scope.mostrarDatos[i].documentos == $scope.mostrarDatosFinal[j].documentos){
                num=1;
                break;
              }
            }
            if(num==0){
              $scope.mostrarDatosFinal.push($scope.mostrarDatos[i]);
              $scope.mostrarDatosFinal[$scope.mostrarDatosFinal.length-1].nEquipos=1;
            }else{
              for(var j=0;j<$scope.mostrarDatosFinal.length;j++){
                if($scope.mostrarDatos[i].documentos == $scope.mostrarDatosFinal[j].documentos){
                  $scope.mostrarDatosFinal[j].nEquipos++;
                }
            }
            }
          }
          for(var i=0;i<$scope.mostrarDatosFinal.length;i++){
            $scope.mostrarDatosFinal[i].numeroEquipo=i+1;
          }
          for(var i=0;i<$scope.mostrarDatosFinal.length;i++){
            var arch= ($scope.mostrarDatosFinal[i].documentos).split(",");

            
              $scope.mostrarDatosFinal[i].archivos=arch;
            
            $scope.mostrarDatosFinal[i].nArchivos=$scope.mostrarDatosFinal[i].archivos.length;
            if($scope.mostrarDatosFinal[i].documentos.trim() == "" || $scope.mostrarDatosFinal[i].documentos.trim() == null){
              $scope.mostrarDatosFinal[i].nArchivos=0;
            }

          }
        }

        $scope.infoCliente={
          "cliente":"",
          "lugar":"",
          "foto":"",
          "archivos":""
        }

        $scope.nuevoDespliegueCliente=function(infoCliente){

          var formData = new FormData();
          for (var i = 0; i < filesArr.length; i++) {
            var file = filesArr[i];
            formData.append("file", file);
            $http({
                  method: 'POST',
                  url: '/upload',
                  data: formData,
                  "headers": {
                    'Content-Type' : undefined // important
                  }
              })
              .then(function(response) {
                
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          }
          
          if(infoCliente.cliente != "" && infoCliente.lugar != ""){
                if(infoCliente.numEquipos == null){
                  infoCliente.numEquipos=1;
                  
                }
              infoCliente.nombre=$scope.versDespliegue.nombre.trim();
              infoCliente.foto=$scope.foto;
              infoCliente.keynombre=$scope.versDespliegue.keynombre.trim();
              infoCliente.keyproyecto=$scope.versDespliegue.keyproyecto.trim();
              infoCliente.proyecto=$scope.versDespliegue.proyecto.trim();
              var datos=infoCliente;
              for (var i = 0; i < parseInt(infoCliente.numEquipos); i++) {
                
                  var url='/nuevoDespliegue/';
                  $http({
                      method: 'POST',
                      url: url,
                      data: datos
                  })
                  .then(function(response) {

                  })
                  .catch(function(response) {
                    console.error('Gists error', response.status, response.data);
                  });
              }
              $timeout( function(){ 
                $('#nuevoLugarClienteModal').modal('hide');
                $scope.desplVersion($scope.versDespliegue); 
              }, 200);

           }else if(infoCliente.cliente == "" && infoCliente.lugar == ""){
              $('#clientExt').css('border','2px solid #D11A1A');
              $('#clientExt').css('border-radius','4px');
              $('#lugarExt').css('border','2px solid #D11A1A');
              $('#lugarExt').css('border-radius','4px');

           }else if(infoCliente.cliente == ""){
              $('#clientExt').css('border','2px solid #D11A1A');
              $('#clientExt').css('border-radius','4px');
              $('#lugarExt').css('border','');
              $('#lugarExt').css('border-radius','');

           }else if(infoCliente.lugar == ""){
              $('#lugarExt').css('border','2px solid #D11A1A');
              $('#lugarExt').css('border-radius','4px');
              $('#clientExt').css('border','');
              $('#clientExt').css('border-radius','');

           }
        }

        $scope.nuevoDespliegueCliente2=function(infoCliente2){

          var formData = new FormData();

          var file = fotoNuevoCliente;
            infoCliente2.foto=file.name;
            formData.append("file", file);
            
            $http({
                  method: 'POST',
                  url: '/upload',
                  data: formData,
                  "headers": {
                    'Content-Type' : undefined // important
                  }
              })
              .then(function(response) {
                
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          
          for (var i = 0; i < filesArr.length; i++) {
            var file = filesArr[i];
            
            formData.append("file", file);
            
            $http({
                  method: 'POST',
                  url: '/upload',
                  data: formData,
                  "headers": {
                    'Content-Type' : undefined // important
                  }
              })
              .then(function(response) {
                
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          }
          infoCliente2.cliente=$scope.infoCliente2.cliente;
          infoCliente2.lugar=$scope.infoCliente2.lugar;
          if(infoCliente2.cliente != null && infoCliente2.lugar != null){
            if(infoCliente2.numEquipos == null){
              infoCliente2.numEquipos=1;
              
            }
          infoCliente2.nombre=$scope.versDespliegue.nombre.trim();
          infoCliente2.keynombre=$scope.versDespliegue.keynombre.trim();
          infoCliente2.keyproyecto=$scope.versDespliegue.keyproyecto.trim();
          infoCliente2.proyecto=$scope.versDespliegue.proyecto.trim();
          var datos=infoCliente2;
          for (var i = 0; i < parseInt(infoCliente2.numEquipos); i++) {
            
              var url='/nuevoDespliegue/';
              $http({
                  method: 'POST',
                  url: url,
                  data: datos
              })
              .then(function(response) {
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          }
          $timeout( function(){ 
            $('#nuevoLugarClienteModal').modal('hide');
            $scope.desplVersion($scope.versDespliegue); 
          }, 200);

           } 
        }

        $scope.nuevoDespliegueExistente=function(infoCliente){

          var formData = new FormData();         
          
          for (var i = 0; i < filesArr.length; i++) {
            var file = filesArr[i];
            formData.append("file", file);
            
            $http({
                  method: 'POST',
                  url: '/upload',
                  data: formData,
                  "headers": {
                    'Content-Type' : undefined // important
                  }
              })
              .then(function(response) {
                
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          }
          

          if(infoCliente.numEquipos == null){
              infoCliente.numEquipos=1;
              
          }
          infoCliente.cliente=$scope.datosRegistro.cliente;
          infoCliente.lugar=$scope.datosRegistro.lugar;
          infoCliente.foto=$scope.datosRegistro.fotocliente;
          infoCliente.nombre=$scope.versDespliegue.nombre.trim();
          infoCliente.keynombre=$scope.versDespliegue.keynombre.trim();
          infoCliente.keyproyecto=$scope.versDespliegue.keyproyecto.trim();
          infoCliente.proyecto=$scope.versDespliegue.proyecto.trim();
          var datos=infoCliente;
          for (var i = 0; i < parseInt(infoCliente.numEquipos); i++) {
            
              var url='/nuevoDespliegue/';
              $http({
                  method: 'POST',
                  url: url,
                  data: datos
              })
              .then(function(response) {
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          }
          
          $timeout( function(){ 
            $('#despliegueModal').modal('hide');
            $scope.desplVersion($scope.versDespliegue); 
          }, 200);
          

           
        }

        var namesArr = [];
        var filesArr = [];

        $scope.fileNameChanged = function (ele) {
          var files = ele.files;
          var l = files.length;
          for (var i = 0; i < l; i++) {
            filesArr.pop();
          }
          for (var i = 0; i < l; i++) {
            filesArr.pop();
          }
          
          for (var i = 0; i < l; i++) {
            filesArr.push(files[i]);
          }

          for (var i = 0; i < l; i++) {
            namesArr.push(files[i].name);
          }

          $scope.namesString = namesArr.join(' ,');
          $scope.$apply();
          $scope.infoCliente.archivos=$scope.namesString;


        }
        //ficheros

          $scope.stepsModel = [];
          var fotoNuevoCliente;

          $scope.imageUpload = function(event){
               var files = event.target.files; //FileList object

              
                   var file = files[0];
                   fotoNuevoCliente=files[0];
                   if(files[0].name.search(".jpg") != -1){
                   $scope.foto2=files[0].name;
                  }
                       var reader = new FileReader();
                       reader.onload = $scope.imageIsLoaded; 
                       reader.readAsDataURL(file);
               
          }

          $scope.imageIsLoaded = function(e){
              $scope.$apply(function() {
                  $scope.stepsModel.pop();

                  $scope.stepsModel.push(e.target.result);
              });
          }
          $scope.foto="no.jpg";
          $scope.foto2="";
          $scope.actualizarFotoCliente=function(infoCliente){
            $scope.fotoMostrar=infoCliente.cliente;
            for(var i=0;i<$scope.empresasVersion.length;i++){
              if($scope.fotoMostrar.trim() === $scope.empresasVersion[i].cliente.trim()){
                $scope.foto=$scope.empresasVersion[i].fotocliente.trim();
              }
            }
          }

          $scope.eliminarIncidencia=function(elem){
            var datos=elem;
            var url='/borrarIncidencia/';
              $http({
                  method: 'POST',
                  url: url,
                  data: datos
              })
              .then(function(response) {


                  var url='/checkIncidencias/'+$scope.versDespliegue.keynombre.trim();
                  $http({
                      method: 'GET',
                      url: url
                  })
                  .then(function(response) {
                    
                    $scope.incidencias2=response.data.Result;
                    $scope.incidencias.pop();
                    for (var i = 0; i < $scope.incidencias2.length; i++) {
                      if($scope.incidencias2[i].keyproyecto.trim() == $scope.versDespliegue.keyproyecto.trim()){

                        $scope.incidencias.push($scope.incidencias2[i]);
                      }

                    }
                    
                    $scope.numeroDeIncidenciasTotal--;
                    
                  })
                  .catch(function(response) {
                    console.error('Gists error', response.status, response.data);
                  });
                
              })
              .catch(function(response) {
                console.error('Gists error', response.status, response.data);
              });
          }


        
    });
    