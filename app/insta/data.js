/*jshint esversion: 8 */
var request=require('request');


module.exports= class InstaData{


  constructor(){
    this.url = 'https://www.instagram.com/';
  }

  post(postId){
    this.url += 'p/' + postId;
    return this;
  }

  _getPostUrl(){
    return this.url + '?__a=1';
  }

  parse(data){
    return new Promise((resolve, reject)=>{
      data = JSON.parse(data);
     var post = {};
     post.img = data.graphql.shortcode_media.display_resources[0];
     post.user = data.graphql.shortcode_media.owner.username;
     post.url = this.url;


     resolve(post);
  });
}

get(url){
  return new Promise((resolve, reject)=>{
    request.get(url, {},function(err, res, body){
      if(err) reject(err);
      if(res.statusCode === 200 )   resolve(body);
    });
  });
}

async load(url){
  const data = await this.get(this._getPostUrl());
  const parsed = await this.parse(data);
  return parsed;
}


};
