var express=require('express'),
path=require('path'),
bodyParser=require('body-parser'),
cons=require('consolidate'),
pg=require('pg'),
app=express();
var Client = require('node-rest-client').Client;

app.engine('html', require('jade').__express);

app.set('view engine','jade');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Conectar a la base de datos
var config = {
  user: 'postgres',
  database: 'cicloSW', 
  password: '1234', 
  port: 5432, 
  max: 10, // max number of connection can be open to database
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);



//Interfaces principales
app.get('/',function(req,res){
  res.sendFile(__dirname+'/views/index.html');
});
app.get('/principal',function(req,res){
  res.sendFile(__dirname+'/views/principal.html');
});
app.get('/principalUsuario',function(req,res){
  res.sendFile(__dirname+'/views/principalUsuario.html');
});
//Pestañas principales
app.get('/monitorizacion',function(req,res){
  res.sendFile(__dirname+'/views/monitorizacion.html');
});
app.get('/despliegue',function(req,res){
  res.sendFile(__dirname+'/views/despliegue.html');
});





app.get('/loginJira/:info',function(req,res){
    var arr = req.params.info.split(',');
  console.log(arr);

    var options_auth = { user: arr[0], password: arr[1] };
    var client = new Client(options_auth);
    console.log(client);
    client.get("https://jira.indra.es/rest/api/2/user?username="+arr[0], function (data, response) {
    // parsed response body as js object 
    console.log(data);
    res.json({
                Result: data
            });


    });

});





//CONEXIONES A LA BASE DE DATOS

//Comprobar usuario

app.get('/checkLogin/:usuario',function(req,res){
      pool.connect(function(err,client,done) {
        if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
        } 
        client.query('SELECT * FROM usuarios WHERE usuario = $1',[req.params.usuario] ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 

           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

app.get('/checkUsuario/:usuario',function(req,res){
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT * FROM usuarios WHERE usuario=$1;",[req.params.usuario] ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

//Comprobar los despliegues de un usuario




app.get('/checkVersiones/:usuario',function(req,res){
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT * FROM versiones WHERE propietario=$1;",[req.params.usuario] ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});






app.get('/checkVersion/:id',function(req,res){
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT keynombre,keyproyecto,nombre,proyecto,porcompletado FROM versiones WHERE id=$1;",[req.params.id] ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

//Eliminar una versión de monitorización





app.post('/registro/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var arr = req.body.displayName.split(',');
    console.log(arr);
       client.query("INSERT INTO usuarios(usuario,email,nombre,apellidos) VALUES('"+req.body.key+"','"+req.body.emailAddress+"','"+arr[1]+"','"+arr[0]+"');",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("registrado");
        return;
       });
    });

});



//Modificar excluir tareas

app.post('/modificarTareas/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       
       console.log(req.body);
       client.query("UPDATE public.versiones SET excluirtareas='"+req.body.excluir+"' WHERE id='"+req.body.id+"';",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});

//CONEXIÓN A LA API REST DE JIRA

app.get('/buscarJira/:info',function(req,res){
  var arr = req.params.info.split(',');
  console.log(arr);
    var options_auth = { user: arr[1], password: arr[2] };
    var client = new Client(options_auth);
    
       var consulta="https://jira.indra.es/rest/api/2/search?jql="+arr[0]+"&maxResults=5000";
      console.log(consulta);
    client.get(consulta, function (data, response) {
    res.json({
                Result: data
            });
    });

});



app.post('/nuevoDespl/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       
       console.log(req.body);

       client.query("INSERT INTO despl(nombre,proyecto,keynombre,keyproyecto,desplegada) VALUES('"+req.body.nombre+"','"+req.body.proyecto+"','"+req.body.keyNombre+"','"+req.body.keyProyecto+"','No');",function(err,result) {
          done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
       });
       });
});


app.post('/nuevaVersion/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       
       console.log(req.body);


       client.query("INSERT INTO versiones(nombre,proyecto,consulta,propietario,porcompletado,excluirtareas,urljira,keynombre,keyproyecto) VALUES('"+req.body.nombre+"','"+req.body.proyecto+"','"+req.body.filtro+"','"+req.body.propietario+"',0,'','"+req.body.url+"','"+req.body.keyNombre+"','"+req.body.keyProyecto+"');",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});




app.get('/checkVersionesAnteriores/:versMon',function(req,res){
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       console.log([req.params.versMon]);
       var arr = req.params.versMon.split(',');
      console.log(arr[0]);
      console.log(arr[1]);
      var query="SELECT * FROM versiones WHERE keynombre='"+arr[0]+"' AND keyproyecto='"+arr[1]+"';";
      console.log(query);
       client.query(query,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

//Cambiar tarea de pruebas

app.post('/modificarTareaPruebas/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
      
       console.log(req.body);
       client.query("UPDATE public.versiones SET tareapruebas='"+req.body.tarea+"' WHERE keynombre='"+req.body.keynombre+"' AND keyproyecto='"+req.body.keyproyecto+"';",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});


//Modificación del porcentaje completado de la tarea

app.post('/modificarPorcCompletado/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
      
       console.log(req.body);
       client.query("UPDATE public.versiones SET porcompletado='"+req.body.media+"' WHERE id='"+req.body.id+"';",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});


//Eliminar una versión de monitorización

app.post('/borrarVersion/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       
       client.query("DELETE FROM versiones WHERE id='"+req.body.id+"';",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("registrado");
        return;
       });
    });

});

app.get('/checkDespl/',function(req,res){
      pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT keynombre,keyproyecto,nombre,proyecto,desplegada FROM despl;",function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});


app.get('/checkDespliegues/',function(req,res){
      pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT * FROM despl WHERE desplegada='Si';",function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});


app.get('/checkIncidencias/:keynombre',function(req,res){
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT * FROM incidencias WHERE keynombre=$1;",[req.params.keynombre] ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

app.get('/checkDespliegueVersion/:nombre',function(req,res){
      pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT DISTINCT cliente,lugar,fotocliente FROM despliegues WHERE nombre = $1",[req.params.nombre],function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

app.get('/checkDespliegue/:nombre',function(req,res){
      pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT * FROM despliegues WHERE nombre = $1",[req.params.nombre],function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

app.get('/checkDespliegue/',function(req,res){
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT keynombre,keyproyecto FROM despliegues",function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});


app.get('/checkClientes/:nombre',function(req,res){
      pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query("SELECT DISTINCT cliente,fotocliente FROM despliegues WHERE nombre = $1",[req.params.nombre],function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
            //console.log(result.rows);
            var count = result.rows;
            res.json({
                Result: count
            });
       });
    });
});

app.post('/nDespliegue/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       
       console.log(req.body);
       client.query("UPDATE public.despl SET desplegada='Si' WHERE keynombre='"+req.body.keynombre+"' AND keyproyecto='"+req.body.keyproyecto+"';",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});

//Upload de imagen de cliente
var multer = require('multer');

//Upload de ficheros


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/files/')
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname);
  }
})

var upload = multer({ storage: storage })
app.post('/upload', upload.any('file'), function(req, res, next) {
  // do something
  console.log(req.body);
  res.send(req.body);
});

app.post('/nuevoDespliegue/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       
       console.log(req.body);
       client.query("INSERT INTO despliegues(nombre,keynombre,keyproyecto,proyecto,cliente,lugar,fotocliente,documentos) VALUES('"+req.body.nombre+"','"+req.body.keynombre+"','"+req.body.keyproyecto+"','"+req.body.proyecto+"','"+req.body.cliente+"','"+req.body.lugar+"','"+req.body.foto+"','"+req.body.archivos+"');",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});

app.post('/nuevaIncidencia/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       }
       
       console.log(req.body);
       client.query("INSERT INTO incidencias(titulo, descripcion, enlacetiger, keynombre, keyproyecto) VALUES('"+req.body.titulo+"','"+req.body.descripcion+"','"+req.body.link+"','"+req.body.keynombre+"','"+req.body.keyproyecto+"');",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("guardada");
        res.redirect('/');
       });
    });

});

app.post('/borrarIncidencia/',function(req,res){
  
  pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       
       client.query("DELETE FROM incidencias WHERE id='"+req.body.id+"';",function(err,result) {
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
        console.log("registrado");
        res.redirect('/');
       });
    });

});




app.listen(3000,function(){
  console.log("Server Started On Port 3000");
});