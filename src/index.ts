import picgo from 'picgo'

import { v2 as cloudinary } from 'cloudinary'
import {formatPath} from './utils'

interface cloudinaryConfig{
    cloud_name: string
    api_key: string
    api_secret: string
    uploadPath: string
}


const handle = async (ctx: picgo)=>{

    let userConfig: cloudinaryConfig = ctx.getConfig("picBed.Cloudinary")
    if(!userConfig){
        throw new Error("RCLONE in Picgo config not exist!")
      }

    if(userConfig.uploadPath){
    userConfig.uploadPath = userConfig.uploadPath.replace(/\/?$/, '')
    }
    for(let index in ctx.output){
        let item = ctx.output[index]
        console.log(item)
        var img = item.buffer.toString('base64')
        var extName = item.extname.split('.')[1]
        var img = `data:image/${extName};base64,${img}`
        var fPath = formatPath(ctx.output[index],userConfig.uploadPath)
        var hashfName = formatPath(ctx.output[index],"{md5}")
        cloudinary.config({ 
            cloud_name: userConfig.cloud_name, 
            api_key: userConfig.api_key, 
            api_secret: userConfig.api_secret,
            secure: true
            });
        const options = {
            //'use_filename' : true,
            'public_id' : fPath + '/' + hashfName,
            'unique_filename': false
        }
        await cloudinary.uploader.upload(img, options ,function(error, result) {
            console.log(result, error);
            item.url = result['secure_url']
            item.imgUrl = result['secure_url']
            return ctx
        });


    }
}

const config = (ctx: picgo) => {
    const defaultConfig: cloudinaryConfig = {
        cloud_name: '',
        api_key: '',
        api_secret: '',
        uploadPath: '{year}/{month}/'
    }
    let userConfig = ctx.getConfig<cloudinaryConfig>('picBed.rclone')
    userConfig = { ...defaultConfig, ...(userConfig || {}) }
    return [
      {
        name: 'cloud_name',
        type: 'input',
        default: userConfig.cloud_name,
        required: true,
        message: '面板显示的cloud_name',
        alias: 'cloud_name'
      },
      {
        name: 'api_key',
        type: 'input',
        default: userConfig.api_key,
        required: true,
        message: 'api_key',
        alias: 'api_key'
      },
      {
        name: 'api_secret',
        type: 'input',
        default: userConfig.api_secret,
        required: true,
        message: 'api_secret',
        alias: 'api_secret'
      },
      {
        name: 'uploadPath',
        type: 'input',
        default: userConfig.uploadPath,
        required: true,
        message: '文件夹配置',
        alias: 'folder'
      }
    ]
}

module.exports = (ctx:picgo) => {
    const register = () => {
      ctx.helper.uploader.register('Cloudinary', {
        config,
        handle,
        name: "Cloudinary"
      })
    }
  
    return {
      register,
      uploader: 'Cloudinary' 
    }
  }