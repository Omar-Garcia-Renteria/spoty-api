var bcrypt = require('bcrypt-nodejs');

const conn = require('mysql2');
var jwt = require('../services/jwt'); //importamos el servicio
var fs = require('fs'); //manejo de archivos
var path = require('path'); //es para rutas o ubicaciones


const conexion = conn.createConnection({
    host:'localhost',
    user:'root',
    password:'mysql',
    database:'mydb'

});

module.exports={
    save(req,res){
        console.log(req.body);
        data=req.body;
        name=data.name;
        username=data.username;
        password=data.password;
        email=data.email;
        if(data.password!='' && data.password!=null){
            bcrypt.hash(data.password,null, null,function(err, hash){
                if(err){
                    console.log(err);
                    res.status(500).send({message:'Intenta nuevamente'})
    
                    }else{
                        password=hash;
                        conexion.query(
                            'INSERT INTO user (name, username, password, email) VALUES ("'+name+'","'+username+'","'+password+'","'+ email+'")',
                function(err,results,fields){
                    if(err){
                        console.log(err)
                        res.status(200).send({message: 'Error, intenta mas tarde'})
                    }else{
                        res.status(201).send({message:'Datos guardados'})
                    }
                        
                    }
                );
            }
        })
        }else{
            res.status(200).send({message: 'introduce una contraseña'})
        }
        bcrypt.hash(data.password,null, null,function(err, hash){
            if(err){
                console.log(err);
                res.status(500).send({message:'Intenta nuevamente'})

                }else{
                    password=hash;
                    conexion.query(
                        'INSERT INTO user (name, username, password, email) VALUES ("'+name+'","'+username+'","'+password+'","'+ email+'")',
            function(err,results,fields){
                if(err){
                    console.log(err)
                    res.status(200).send({message: 'Error, intenta mas tarde'})
                }else{
                    res.status(200).send({message:'Datos guardados'})
                }
                    
                }
            );
        }
    })
       
        
    },
    list (req,res){

        console.log(req.user);
        conexion.query(
            'SELECT * from user',
            function (err, results, fields){
                if(results){
                    res.status(200).send({data:results})
                }else{
                    res.status(500).send({message:'Error: Intentalo mas tarde'})
                }
            }
        );

        //res.status(200).send({message:'listado de usuarios'})
    },
    login(req,res){ //login es una funcion
        var data = req.body;
        var username = data.username;
        var password = data.password;
        var token = data.token;
        conexion.query('SELECT * FROM user WHERE username = "'+username+'" LIMIT 1', //para ver si existe y el LIMIT seria como para que no se repita y solo de uno
        function(err,results,fields){
            console.log(results);
            if(!err){
                if(results.length == 1){
                    bcrypt.compare(password,results[0].password,function(err,check){
                        if(check){
                            if (token){
                                res.status(200).send({token: jwt.createToken(results[0])})
                            }else{
                                res.status(200).send({message:'Datos correctos'})
                            }
                        }else{
                            res.status(200).send({message:'datos incorrectos'})
                        }
                    })
                }else{
                    res.status(200).send({message:'datos incorrectos'})
                }
                }else{
                    console.log(err);
                    res.status(500).send({message:"intentalo mas tarde"});
                }
                // console.log(results[0].password);
            });
    },
    delete(req,res){
        id = req.params.id;
        conexion.query('DELETE FROM user WHERE id ='+id,function(err,results,fields){
            if(err){
                if(results.affectedRows!=0){
                res.status(200).send({message: 'registro eliminado'})
                }else{
                res.status(500).send({message: 'no se elimino nada'})
                }
            }else{
                console.log(err);
                res.status(500).send({message:"intentalo mas tarde"})
            }

        })
    },
    update(req,res){
        data = req.body;
        name = data.name;
        username = data.username;
        password = data.password;
        email = data.email;
        console.log(data);
        conexion.query('UPDATE user SET (name,username,password,email,image) VALUES ("'+name+'","'+username+'","'+password+'","'+email+'")')
    },
   update(req, res) {
        id = req.params.id;
        data = req.body;
        var sql = 'UPDATE user SET ? WHERE id=?';
        if (data.password) {
            bcrypt.hash(data.password, null, null, function (err, hash) {
                if (!err) {
                    data.password = hash;
                    conexion.query(sql, [data, id],
                        function (err, results, fields) {
                            console.log(results);
                            if(results.length == 1){

                            }else{
                                res.status(200).send({message: 'datos correctos'})
                            }
                            if (!err) {
                                console.log(results);
                            } else {
                                console.log(err);
                            }
                        });
                }
            })
        } else {
            conexion.query(sql, [data, id],
                function (err, results, fields) {
                    if (!err) {
                        console.log(results);
                    } else {
                        console.log(err);
                    }
                });
        }


    },
    uploadimage(req,res){
        var id = req.params.id;
        var file ='sin imagen...';
        console.log(req.files.image.path)
        if(req.files){
            var file_path = req.files.image.path;
            var file_split= file_path.split('\\');
            var file_name = file_split[2];
            var ext = file_name.split('\.');
            var file_ext = ext[1];
            if(file_ext=='jpg' || file_ext=='gif' || file_ext=='png' || file_ext=='jpeg'){
                conexion.query('UPDATE user SET image="'+file_name+'" WHERE id='+id,
                function(err,results,fields){
                    if(!err){
                        if(results.affectedRows!=0){
                            res.status(200).send({message: 'imagen acualizado'})
                        }else{
                            res.status(200).send({message: 'error al actualizar'})
                        }
                    }else{
                        console.log(err);
                        res.status(200).send({message: 'imagen no valido'})
                    }
                    

                })

            }
        }
    },
    getImage(req,res){
        var image=req.params.image;
        var path_file='./uploads/user/'+image;
        console.log(path_file)
        if(fs.existsSync(path_file)){
            res.sendfile(path.resolve(path_file))
        }else{
            res.status(404).send({message: 'no existe el archivo'})
        }
    },
    delImage(req,res){
        id = req.params.id;
        var sql = "select image from user WHERE id="+id;
        conexion.query(sql,function(err,results,fields){
            if(!err){
                if (results.length !=0) {
                    if(results[0].image != null) {
                        var path_file = './uploads/user/' +results[0].image;
                        try {
                            fs.unlinkSync(path_file);
                            res.status(200).send({message: "imagen eliminada"})
                        } catch (error) {
                            console.log(error)
                            res.status(200).send({message: "no se pudo eliminar, intenta mas tarde"})
                            
                        }
                    }else{
                        res.status(404).send({message: "no encontrada"})
                        
                    }
                } else{
                    res.status(404).send({message: "no encontrada"})

                }
            }
        })

    }
}
