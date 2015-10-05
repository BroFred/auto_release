
//mount -t smbfs '//nas01;administrator:icssynergy@nas01/Allshare/Projects/BCC_MAINE' ./share
var express=require('express');
var app=express();
var fs=require('fs');
var formidable = require('formidable');
app.use(express.static('./public'));
var child_process =require('child_process');
var regs1=/indus_clm_claim__\d+\.txt/i;
var regs2=/indus_clm_claimdiag__\d+\.txt/i;
var regs3=/indus_clm_claimdetail__\d+\.txt/i;
var regs4=/indus_mbr_member__\d+\.txt/i;
var regs5=/indus_prv_provider__\d+\.txt/i;
var regs6=/indus_prv_providertype__\d+\.txt/i;
var regs7=/indus_prv_affiliation__\d+\.txt/i;
var regs8=/indus_prv_planaffilinfo__\d+\.txt/i;
var pattern=/.*\.zip/;
var option= {cwd:'/Users/Frederic/auto_release/upload'};
var count=0;
function clean(){
        var date;
        var s='';
        fs.readdir('./upload', function(err,files){
            for(var i in files){
                if(pattern.test(files[i])){
                    fs.unlinkSync('./upload/'+files[i]);
                }
            }
        });
        fs.readdir('./upload/temp', function(err,files){
            for(var i in files){
                if(regs1.test(files[i])||regs2.test(files[i])||regs3.test(files[i])||regs4.test(files[i])||regs5.test(files[i])||regs6.test(files[i])||regs7.test(files[i])||regs8.test(files[i])){
                    date=files[i].substring(files[i].search(/\d/),files[i].search('.txt'));
                    console.log(files[i]);
                }
                else{
                    if(files[i]!=='mihms.ini')
                        fs.unlinkSync('./upload/temp/'+files[i]);
                }
            }
            fs.readFile('./upload/mihms.ini', function (err, data) {
                data=data.toString();
                data=data.replace(/\d{8}/g,date);
                fs.writeFile('./upload/temp/mihms.ini',data,function(err){
                    console.log('finished ini file');
                });
            });
        });
}
var countNum=function(){
    console.log(count);
    count++;
    if(count===3){
        process.nextTick(clean);
    }
}
app.post('/upload',function(req,res){
	var form = new formidable.IncomingForm();
	var temp;
	form.uploadDir = "./upload";
	form.keepExtensions = true;
    form.parse(req,function(err, fields, files){
    	fs.readdir('./upload', function(err,files){
    		if(err) 
    			throw err;
    		for(var i in files){
				if(pattern.test(files[i])){
	    			child_process.exec('unzip '+files[i]+' -d /Users/Frederic/auto_release/upload/temp',option,function (err, stdout, stderr){
					    if (err) {
					        console.log("child processes failed with error code: " +err.code);
					    }
					}).on('close',countNum);
    			}
    		}
    	});
    });
    res.sendFile('index.html',{root:'./public'});
});
app.get('/download',function(req,res){
    fs.readdir('./upload/temp',function(err,files){
        var count=0;
        for(var i in files){
            (function(file){
                fs.readFile('./upload/temp/'+file,function(err,data){
                    if(err) throw err;
                    fs.unlink('./upload/temp/'+file);
                    if(file!=='mihms.ini'){
                        fs.writeFile('../share/New\ MBCHP\ Feeds\ \(Instead\ of\ MECMS\)/MIHMS\ Feeds/MIHMS_LOAD_DIRECTORY/'+file,data,function(){
                            count++;
                            console.log('write '+ file);
                        });
                    }
                    else{
                        fs.writeFile('../share/New\ MBCHP\ Feeds\ \(Instead\ of\ MECMS\)/MIHMS\ Feeds/'+file,data,function(){
                            count++;
                            console.log('write '+ file);
                        });
                    }
                })
            })(files[i]);
        }
    });
    res.sendStatus(200);
});
/*app.get('/download',function(req,res){
    var upload=function(){
        res.sendFile('doc.zip',{ root:'./upload' },function(){
            fs.unlink('./upload/doc.zip',function(){
                fs.readdir('./upload/temp',function(err,files){
                    for(var i in files){
                        if(files[i]!=='mihms.ini')
                            fs.unlink('./upload/temp/'+files[i]);
                    }
                });
            });
        });
    }
    child_process.exec('zip -r doc.zip temp',option,function (err, stdout, stderr){
        if (err) {
            console.log("child processes failed with error code: " +err.code);
        }
    }).on('close',upload);
});
*/
app.listen(3000,function(){
	console.log('listen 3000....');
});