let fs = require('fs');
let join = require('path').join;
let ipc = require('electron').ipcRenderer;

/**
 * 文件路径以及请求代理地址
 */

/******************************************** 开发环境 ********************************************/
let localPath = 'D:/19Home/cache/shared';
let BootParamsFilePath = 'D:/19Home/cache/datatransfer.json';
let degree360Path = 'D:/19Home/cache';
let memberUI = 'D:/19Home/UI';
let UE4Path = 'D:\\19Home\\unreal\\Area19\\Binaries\\Win64\\Area19.exe';
let CWebp = 'D:\\19Home\\cwebp.exe';
let DWebp = 'D:\\19Home\\dwebp.exe';
let RequestHost = '/api/Designer19AreaAdmin/';

/******************************************** 打包用 ********************************************/
// let localPath = 'cache/shared/';
// let BootParamsFilePath = 'cache/datatransfer.json';
// let degree360Path = 'cache/';
// let memberUI = 'UI';
// let UE4Path = '"unreal/Area19/Binaries/Win64/Area19.exe"';
// let CWebp = 'cwebp.exe';
// let DWebp = 'dwebp.exe';
// //刘英杰服务端地址（测试环境用）
// let RequestHost = 'http://192.168.78.142:8080/Designer19AreaAdmin/';
// //外网环境地址（正式环境用）
// let RequestHost = 'https://design.19area.cn/';

/***********************************************************************************************/

let archiver = require('archiver');
let adm_zip = require('adm-zip');
let request = require("request");
let https = require('https');

let zlib = require('zlib');

/**
 * 数据转换
 * @param {blob} blob 
 * @param {Function} cb 
 */
const blobToBuffer = function (blob, cb) {
  if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
    throw new Error('first argument must be a Blob')
  }
  if (typeof cb !== 'function') {
    throw new Error('second argument must be a function')
  }

  var reader = new FileReader()

  function onLoadEnd(e) {
    reader.removeEventListener('loadend', onLoadEnd, false)
    if (e.error) cb(e.error)
    else cb(null, Buffer.from(reader.result))
  }

  reader.addEventListener('loadend', onLoadEnd, false)
  reader.readAsArrayBuffer(blob)
}


/**
 * 压缩文件 
 * @param {String} schemeNo 
 * @param {Function} callback 
 */
const zipCompressedFolder = function (schemeNo, callback) {
  let url = `${localPath}/${schemeNo}_pattern`;
  if (!fs.existsSync(url)) {
    console.log('没有对应的拼花文件');
    callback && callback.call(this, false);
    return false;
  }

  let output = fs.createWriteStream(`${localPath}/${schemeNo}.zip`);
  let archive = archiver('zip');
  let buffer;

  archive.on('error', function (err) {
    if (err) throw err;
  });

  archive.pipe(output);

  fs.readdir(url, (err, files) => {
    if (!fs.existsSync(url)) { return false }
    if (err) throw err;
    files.forEach((file) => {
      let ary = file.split(".");
      let suffix = ary[ary.length - 1];
      if (suffix == "webp") {
        archive.append(fs.createReadStream(join(url, file)), { 'name': file });
      }
    });
    output.on('close', function (err) {
      if (err) throw err;
      callback && callback.call(this, true);
    });
    archive.finalize();
  });
};


window.Native = {
  //定义配置常量
  Golbal: {
    //请求代理地址
    host: RequestHost,
    //文件路径
    filesPath: {
      localPath: localPath,
      BootParamsFilePath: BootParamsFilePath,
      degree360Path: degree360Path,
      memberUI: memberUI,
      UE4Path: UE4Path
    }
  },

  /**
   * 保存拼花png和svg
   * @param {Object} param 
   * {
   *  file:     需要转换的文件
   *  svgText:  SVG文本
   *  schemeNo: 方案No
   *  fileName: 保存的文件名称
   *  callback: 保存回调
   * } 
   */
  savePatternImgAndSvg({ file, svgText, schemeNo, fileName, callback }) {
    if (!fs.existsSync(`${localPath}/${schemeNo}_pattern`)) {
      fs.mkdirSync(`${localPath}/${schemeNo}_pattern`);
    }
    //存png
    let urlPng = `${localPath}/${schemeNo}_pattern/${fileName}.pattern.png`;
    let urlWebp = `${localPath}/${schemeNo}_pattern/${fileName}.pattern.webp`;
    fs.open(urlPng, 'w+', function (err, fd) {
      blobToBuffer(file, function (err, buffer) {
        fs.write(fd, buffer, function () {
          fs.close(fd, function (err) { });
          //存svg
          let urlSvg = `${localPath}/${schemeNo}_pattern/${fileName}.pattern.svg`;
          fs.open(urlSvg, 'w+', function (err, fd) {
            fs.write(fd, new Buffer(svgText), () => {
              fs.close(fd, function (err) { });
              setTimeout(() => {
                window.Native.png2webp(urlPng, urlWebp);
              }, 100);
              callback(`${fileName}.pattern.png`);
            });
          });
        })
      });
    });
  },

  /**
   * png转换webp
   * @param {String} urlPng 
   * @param {String} urlWebp 
   */
  png2webp(urlPng, urlWebp) {
    let { exec } = require('child_process');
    let cmd = `${CWebp} ${urlPng} -o ${urlWebp} -q 85`;
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        console.log('get weather api error:' + stderr);
      }
    });
  },

  /**
   * webp转换png
   * @param {String} urlPng 
   * @param {String} urlWebp 
   */
  webp2png(urlPng, urlWebp, callback) {
    let { exec } = require('child_process');
    let cmd = `${DWebp} ${urlWebp} -o ${urlPng}`;
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        console.log('get weather api error:' + stderr);
      } else {
        callback && callback();
      }
    });
  },

  /**
   * 下载方案，webp转png
   * @param {Object} param 
   * {
   *  schemeNo: 方案No
   *  fileName: 保存的文件名称
   *  callback: 保存回调
   * } 
   */
  saveSvgToImg({ schemeNo, fileName, callback }) {
    if (!fs.existsSync(`${localPath}/${schemeNo}_pattern`)) {
      fs.mkdirSync(`${localPath}/${schemeNo}_pattern`);
    }
    //存png
    let pngName = fileName.replace("webp", "png");
    let urlWebp = `${localPath}/${schemeNo}_pattern/${fileName}`;
    let urlPng = `${localPath}/${schemeNo}_pattern/${pngName}`;
    window.Native.webp2png(urlPng, urlWebp, () => {
      callback && callback();
    });
  },

  /**
  * 保存文件
  * @param {Object} project 保存文件的数据
  * @param {String} schemeNo 保存文件的名称（方案No）
  * @param {Function} callback 保存之后的回调函数，参数（project: 保存文件之后的数据, buffer: 读取文件对应的buffer）
  * @param {Boolean} isNotMod 是否转换单位
  */
  saveProject: function (project, schemeNo, callback, isNotMod) {
    fs.open(`${localPath}/${schemeNo}.json`, 'w+', function (err, fd) {
      let text = "";
      if (isNotMod) {
        text = JSON.stringify(project, null, 2);
      } else {
        text = JSON.stringify(project, (key, value) => {
          return value;
        }, 2);
      }
      fs.write(fd, text, "binary", function (...arg) {
        fs.close(fd, function (err) { });
        let buffer = fs.readFileSync(`${localPath}/${schemeNo}.json`);
        callback(project, buffer);
      })
    });
  },

  /**
   * 获取保存文件列表
   * @param {Function} callback 回调函数，参数（list: 文件列表）
   */
  getProjectList: function (callback = function () { }) {
    let files = fs.readdirSync(localPath);
    files = files.filter((val, index) => {
      if (!(/^\w+.json$/.test(val))) { return false }
      let fPath = join(localPath, val);
      let stats = fs.statSync(fPath);
      return stats.isFile();
    });
    let list = [];
    files.forEach((val) => {
      let contentText = fs.readFileSync(join(localPath, val), "utf-8");
      list.push(JSON.parse(contentText));
    });
    callback(list);
  },

  /**
   * 通过ID获取相对应的文件
   * @param {String} id 对应的ID
   * @param {String} schemeNo 文件名称（方案No）
   * @param {Function} callback 回调函数，参数（project: 获取的文件数据）
   */
  getProjectAsId: function (id, schemeNo, callback = function () { }) {
    try {
      let contentText = fs.readFileSync(join(localPath, schemeNo + '.json'), "utf-8");
      let project = JSON.parse(contentText, (key, value) => {
        return value;
      });
      project.id = id;
      try {
        callback(project);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      callback(null);
    }
  },

  /**
   * 通过ID删除文件
   * @param {String} id 对应的ID
   */
  removeProjectAsId(id) {
    fs.unlinkSync(join(localPath, id + '.json'));
  },

  /**
   * 更换文件名称
   * @param {String} src 原始路径名称
   * @param {String} dest 更换路径名称
   */
  renameProjectPatternBySchemeNo(src, dest) {
    fs.renameSync(`${localPath}/${src}_pattern`, `${localPath}/${dest}_pattern`);
    fs.renameSync(`${localPath}/${src}.zip`, `${localPath}/${dest}.zip`);
  },

  /**
  * 创建进入3D界面
  * @param {Number} memberGid 用户Gid
  * @param {String} token 登录token
  * @param {Number} type 用户Gid 1.卖场会员, 2.设计师会员, 8.场景管理员
  * @param {String} schemeNo 方案No
  * @param {Number} projectType 方案类型 1.我的方案, 2.公共方案, 3.分享给我的方案，4.企业方案
  * @param {String} projectid 方案ID
  * @param {String} takePicture
  */
  build3D: function (memberGid, token, type, schemeNo, projectType, projectid, takePicture) {
    let { exec } = require('child_process');
    if (takePicture == undefined) {
      takePicture = 0;
    }
    if (window.threeDnum >= 1) {
      //todo:弹出框提示已经存在3D，请关闭后在打开
      //return;
    }
    window.threeDnum = 1;
    let cmd = `${UE4Path} --memberGid=${memberGid} --token=${token} --type=${type} --schemeNo=${schemeNo} --projectType=${projectType} --projectid=${projectid} --takePicture=${takePicture}`;
    exec(cmd, (result) => {
      window.threeDnum = 0;
    });
    window.isChanged = false;
  },

  /**
   * 转换URL成Blob
   * @param {String} dataurl 需要转换的URL
   */
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },

  /**
   * 获取用户信息（datatransfer.json）
   */
  getBootParams() {
    var params = {};
    try {
      let BootParamsText = fs.readFileSync(BootParamsFilePath, "utf-8");
      params = JSON.parse(BootParamsText)
      window.BootParams = params;
      console.log(window.BootParams);
    } catch (error) {
      window.BootParams = params;
    }
  },

  /**
   * 保存360全景信息
   * @param {Object} project 需要保存的数据
   */
  save360Degree(project) {
    fs.open(`${degree360Path}/cameraData.json`, 'w+', function (err, fd) {
      let text = "";
      text = JSON.stringify(project, (key, value) => {
        return value;
      }, 2);
      fs.write(fd, text, function (...arg) {
        fs.close(fd, function (err) { });
        let buffer = fs.readFileSync(`${degree360Path}/cameraData.json`);
      })
    });
  },

  /**
   * 保存用户登录信息（datatransfer.json）
   * @param {Object} project 保存的用户登录信息
   * @param {Function} callback 回调函数
   */
  saveDataTransfer(project, callback) {
    fs.open(`${degree360Path}/datatransfer.json`, 'w+', function (err, fd) {
      let text = "";
      text = JSON.stringify(project, (key, value) => {
        return value;
      }, 2);
      fs.write(fd, text, function (...arg) {
        fs.close(fd, function (err) { });
        let buffer = fs.readFileSync(`${degree360Path}/datatransfer.json`);
        callback && callback();
      })
    })
  },

  /**
   * 处理图片操作
   */
  HandleImg: function () {
    /**
     * 获取皮肤本地路径
     */
    this.getSkinImg = () => {
      return memberUI;
    }
    /**
     * 删除图片
     * @param {String} filePath 图片地址 
     */
    this.deleteImg = (filePath) => {
      fs.unlinkSync(filePath);
    }
    /**
     * 获取图片流
     */
    this.getImgUrl = () => {
      let skinPanth = fs.readFileSync((memberUI + "/skin.png"), "base64");
      return "data:image/jpg;base64," + skinPanth;
    }
    /**
     * 判断文件是否存在
     * @param {String} memberUI 文件地址
     */
    this.mkdirSync = (memberUI) => {
      if (fs.existsSync(memberUI)) {
        return true;
      } else {
        return false;
      }
    }
    /**
     * 保存图片文件到本地
     * @param {String} imgBase64 图片的base64编码
     * @param {String} imgName 保存的文件名称
     */
    this.downloadUrl = (imgBase64, imgName) => {
      var base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, "");
      var dataBuffer = new Buffer(base64Data, 'base64');
      fs.writeFile(`${memberUI}/${imgName}`, dataBuffer, function (err) {
        if (err) {
          console.log(err);
        } else {
          // console.log(`${imgName}：保存成功！`);
        }
      });
    }
  },

  /**
   * 下载网络资源文件
   * @param {String} url 
   * @param {Function} callback 
   */
  downloadNetworkFile2Text(url, callback) {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (d) => {
        data += d;;
      });
      res.on('end', () => {
        callback && callback(data);
      });

    }).on('error', (e) => {
      console.error(e);
    });
  },

  /**
   * 读取压缩文件
   * @param {String} schemeNo 
   * @param {Function} callback 
   */
  readZipFiles(schemeNo, callback) {
    zipCompressedFolder(schemeNo, () => {
      let file = `${localPath}/${schemeNo}.zip`;
      if (!fs.existsSync(file)) {
        console.log('没有对应的拼花压缩文件');
        callback && callback.call(this, false);
        return false;
      } else {
        let buffer = fs.readFileSync(file);
        callback && callback.call(this, buffer);
      }
    });
  },

  /**
   * 删除文件
   * @param {String} path 
   * @param {String} fileName 
   * @param {String} type 
   */
  deleteFiles(path, fileName, type) {
    let filePath = path || localPath;
    let fileType = type || "zip";
    let file = `${filePath}/${fileName}.${type}`;
    fs.unlinkSync(file);
  },

  /**
   * 解压zip
   * @param {String} zipPath 
   * @param {String} unzipPath 
   * @param {Function} callback 
   */
  unzip(unzipPath, callback) {
    let path = `${localPath}/${unzipPath}_pattern/${unzipPath}.zip`;
    let unzip = new adm_zip(path);
    unzip.extractAllTo(`${localPath}/${unzipPath}_pattern`, true);
    fs.readdir(`${localPath}/${unzipPath}_pattern`, (err, files) => {
      callback && callback.call(this, files);
    });
  },

  /**
   * 创建文件夹
   * @param {String} schemeNo 
   * @param {Function} callback 
   */
  addSvgFile(schemeNo, callback) {
    if (!fs.existsSync(`${localPath}/${schemeNo}_pattern`)) {
      fs.mkdirSync(`${localPath}/${schemeNo}_pattern`);
    }
    callback && callback();
  },

  /**
   * 保存到本地
   * @param {String} file 
   * @param {String} schemeNo 
   * @param {Function} callback 
   */
  saveZip(file, schemeNo, callback) {
    let path = `${localPath}/${schemeNo}_pattern/${schemeNo}.zip`;
    let stream = fs.createWriteStream(path);
    request(file).pipe(stream).on('close', () => {
      callback && callback.call(this, path);
    });
  },

  /**
   * 读取Svg
   * @param {*} file 
   * @param {*} schemeNo 
   * @param {*} callback 
   */
  readSvg(file, schemeNo, callback) {
    let data = fs.readFileSync(`${localPath}/${schemeNo}_pattern/${file}`, "utf-8");
    callback && callback.call(this, data);
  },

  /**
   * 删除文件
   * @param {*} file 
   * @param {*} schemeNo 
   * @param {*} callback 
   */
  delFile(file, schemeNo, callback) {
    let path = `${localPath}/${schemeNo}_pattern/${file}`;
    fs.unlinkSync(path);
  },

  /**
   * 判断文件夹是否存在
   * 没有创建，有直接返回
   * @param {String} src 目标文件(复制的源文件)
   * @param {String} dist 检测文件
   * @param {Function} callback 回调
   */
  existDirectory(src, dist, callback) {
    let path_src = `${localPath}/${src}`;
    let path_dist = `${localPath}/${dist}`;

    //判断源文件是否存在
    if (!fs.existsSync(path_src)) {
      console.log("源文件不存在");
      callback && callback.call(this, false, false);
      return false;
    }

    //判断目标文件是否存在，不存在新建
    if (!fs.existsSync(path_dist)) {
      fs.mkdirSync(path_dist);
      callback && callback.call(this, path_src, path_dist);
    } else {
      callback && callback.call(this, path_src, path_dist);
    }
  },

  /**
   * 复制文件夹，子文件夹，文件
   * @param {*} srcDir 
   * @param {*} tarDir 
   * @param {*} cb 
   */
  copyFolder(srcDir, tarDir, cb) {
    let count = 0;
    fs.readdir(srcDir, (err, files) => {
      if (err) throw err;
      let length = files.length;

      files.forEach((file) => {
        let srcPath = join(srcDir, file);
        let tarPath = join(tarDir, file);

        fs.stat(srcPath, (err, stats) => {
          if (stats.isDirectory()) {
            //文件先检测
            window.Native.existDirectory(srcPath, tarPath, (sDir, tDir) => {
              window.Native.copyFolder(sDir, tDir, cb);
            });
          } else {
            count++;
            fs.createReadStream(srcPath).pipe(fs.createWriteStream(tarPath));
            if (count === length) {
              cb && cb();
            }
          }
        })
      });
    })
  }
}

