// 配置 OSS SDK
var client = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: 'LTAI5tAQRdyBKwUjdBadsQAq',
  accessKeySecret: 'WQ3YtegDitXwijdfDogHGXHMMGJ1XM',
  bucket: 'awaken-age'
});

// 获取照片URL列表
client.list({
  'max-keys': 1000,
  'prefix': '2023-4-29-五一武汉行/'
}).then(function(result) {
  var photos = result.objects;

  function lazyLoadImages() {
    var images = document.querySelectorAll('.image img');
    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      if (isElementInViewport(image) && !image.src) {
        image.src = image.getAttribute('data-src');
      }
    }
  }

  function isElementInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  var loadedImages = 0; // 记录已加载的图片数量
  var totalImages = Math.min(photos.length, 10); // 设置每次加载的图片数量上限

  // 生成照片墙
  for (var i = 0; i < totalImages; i++) {
    var photo = photos[i];

    // 判断文件类型为图片
    if (photo.size && photo.name.match(/\.jpe?g$|\.png$|\.gif$/i)) {
      var thumbnailUrl = client.signatureUrl(photo.name, {
        expires: 3600,
        process: 'image/auto-orient,1/resize,m_lfit,w_200/quality,q_50'
      }); // 生成缩略图URL，有效期为1小时
      var fullSizeUrl = client.signatureUrl(photo.name, { expires: 3600 }); // 生成原图URL，有效期为1小时
      $('#gallery').append('<div class="image"><a href="' + fullSizeUrl + '"><img src="' + thumbnailUrl + '" data-src="' + fullSizeUrl + '"></a></div>'); // 添加到照片墙中
      loadedImages++;
    }
  }

  // 监听滚动事件，动态加载更多图片
  window.addEventListener('scroll', function() {
    if (loadedImages < photos.length) {
      if (isElementInViewport(document.querySelector('.image:last-child img'))) {
        var startIndex = loadedImages;
        var endIndex = Math.min(loadedImages + totalImages, photos.length);

        for (var i = startIndex; i < endIndex; i++) {
          var photo = photos[i];

          if (photo.size && photo.name.match(/\.jpe?g$|\.png$|\.gif$/i)) {
            var thumbnailUrl = client.signatureUrl(photo.name, {
              expires: 3600,
              process: 'image/auto-orient,1/resize,m_lfit,w_200/quality,q_50'
            }); // 生成缩略图URL，有效期为1小时
            var fullSizeUrl = client.signatureUrl(photo.name, { expires: 3600 }); // 生成原图URL，有效期为1小时
            $('#gallery').append('<div class="image"><a href="' + fullSizeUrl + '"><img src="' + thumbnailUrl + '" data-src="' + fullSizeUrl + '"></a></div>'); // 添加到照片墙中
            loadedImages++;
          }
        }

        // 执行懒加载函数
        lazyLoadImages();
      }
    }
  });

  // 懒加载函数
  function lazyLoadImages() {
    var images = document.querySelectorAll('.image img');
    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      if (isElementInViewport(image) && !image.src) {
        image.src = image.getAttribute('data-src');
      }
    }
  }

  // 判断元素是否在可视区域内的函数
  function isElementInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
});

$('.gallery').magnificPopup({
  delegate: 'a',
  type: 'image',
  gallery: {
      enabled: true
  }
});