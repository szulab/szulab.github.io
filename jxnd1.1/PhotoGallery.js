class PhotoGallery {
    constructor(region, accessKeyId, accessKeySecret, bucket, path) {
      this.client = new OSS({
        region: region,
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        secure: true,
        bucket: bucket
      });
      this.path = path;
      this.initGallery();
    }
  
    listPhotos() {
      return this.client.list({
        'max-keys': 1000,
        'prefix': this.path
      }).then((result) => {
        var photos = result.objects;
        return photos.filter((photo) => {
          return photo.size && photo.name.match(/\.jpe?g$|\.png$|\.gif$/i);
        });
      });
    }
  
    generatePhotoUrls(photo) {
      var photoUrl = this.client.signatureUrl(photo.name, {expires: 3600});
      var thumbnailUrl = this.client.signatureUrl(photo.name, {expires: 3600, process: 'image/auto-orient,1/quality,q_25'});
      return {photoUrl, thumbnailUrl};
    }
  
    lazyLoadImages() {
      var images = document.querySelectorAll('.image img');
      for (var i = 0; i < images.length; i++) {
        var image = images[i];
        if (this.isElementInViewport(image) && !image.src) {
          image.src = image.getAttribute('data-src');
        }
      }
    }
  
    isElementInViewport(element) {
      var rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  
    initGallery() {
      this.listPhotos().then((photos) => {
        var loadedImages = 0;
        var totalImages = Math.min(photos.length, 5);
        for (var i = 0; i < totalImages; i++) {
          var photo = photos[i];
          var urls = this.generatePhotoUrls(photo);
  
          $('#gallery').append('<div class="image"><a href="'+ urls.photoUrl +'" ><img src="' + urls.thumbnailUrl + '"></a></div>');
        
          loadedImages++;
        }
  
        window.addEventListener('scroll', () => {
          if (loadedImages < photos.length) {
            if (this.isElementInViewport(document.querySelector('.image:last-child img'))) {
              var startIndex = loadedImages;
              var endIndex = Math.min(loadedImages + totalImages, photos.length);
  
              for (var i = startIndex; i < endIndex; i++) {
                var photo = photos[i];
                var urls = this.generatePhotoUrls(photo);
  
                $('#gallery').append('<div class="image"><a href="'+ urls.photoUrl +'" ><img src="' + urls.thumbnailUrl + '"></a></div>');
                loadedImages++;
              }
            }
          }
  
          this.lazyLoadImages();
        });
  
        this.lazyLoadImages();
      });
  
      $('.gallery').magnificPopup({
        delegate:'a',
        type:'image',
        gallery:{
          enabled:true
        }
      });
    }
  
    upload() {
      var files = document.getElementById("fileName").files;
      if(files.length == 0)alert("先选照片捏");
      else{
        for(var i = 0; i < files.length; i++){
          var file = files[i];
          var val = file.name;
          var suffix = val.substr(val.indexOf("."));// 取出文件后缀名
          var obj = this.timestamp(i);
          var storeAs = this.path + obj + suffix;
          this.client.multipartUpload(storeAs, file).then((result) => {
            var url = result.res.requestUrls[0];
            var length = url.lastIndexOf('?');
            var imgUrl = url.substr(0,length);//文件最终路径
            console.log(url.substr(0,length));
          }).catch((err) => {
            console.log(err);
          });
        }
        var _file = document.getElementById("fileName");
        _file.outerHTML = _file.outerHTML;
      }
    }
  
    timestamp(num) {
      var time = new Date();
      var y = time.getFullYear();
      var m = time.getMonth() + 1;
      var d = time.getDate();
      var h = time.getHours();
      var mm = time.getMinutes();
      var s = time.getSeconds();
      return "" + y + this.add0(m) + this.add0(d) + this.add0(h) + this.add0(mm) + this.add0(s) + num;
    }
  
    add0(m) {
      return m < 10 ? '0' + m : m;
    }
  }
  