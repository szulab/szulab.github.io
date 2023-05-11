// 配置OSS SDK
var client = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: 'LTAI5tAQRdyBKwUjdBadsQAq',
  accessKeySecret: 'WQ3YtegDitXwijdfDogHGXHMMGJ1XM',
  bucket: 'awaken-age'
});

// Intersection Observer 配置
var observerOptions = {
  root: null, // 默认为视口
  threshold: 0.1 // 当图片进入视口超过 10% 时加载图片
};

// 获取照片URL列表
client.list({
  'max-keys': 1000, // 最大返回1000个文件
  'prefix': '2022-4-3-清明拯救不开心/' // 指定获取以'test/'开头的文件列表
}).then(function(result) {
  var photos = result.objects; // 获取文件列表

  // 创建 Intersection Observer 实例
  var observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var photo = entry.target;
        var photoUrl = client.signatureUrl(photo.dataset.name, { expires: 3600 }); // 生成URL，有效期为1小时
        photo.src = photoUrl; // 加载图片
        observer.unobserve(photo); // 停止观察该图片
      }
    });
  }, observerOptions);

  // 生成照片墙
  for (var i = 0; i < photos.length; i++) {
    var photo = photos[i];

    // 判断文件类型为图片
    if (photo.size && photo.name.match(/\.jpe?g$|\.png$|\.gif$/i)) {
      var photoUrl = client.signatureUrl(photo.name, { expires: 3600 }); // 生成URL，有效期为1小时

      // 创建 img 元素
      var img = document.createElement('img');
      img.dataset.name = photo.name; // 保存图片文件名
      img.setAttribute('data-src', photoUrl); // 设置图片 URL 为 data-src 属性
      img.className = 'lazy-img'; // 添加懒加载图片的类名

      // 将 img 元素添加到照片墙中
      document.getElementById('photo-wall').appendChild(img);

      // 开始观察图片
      observer.observe(img);
    }
  }
});
