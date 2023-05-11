// OSSConfig 类
class OSSConfig {
  constructor(region, accessKeyId, accessKeySecret, bucket) {
    this.region = region;
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;
    this.bucket = bucket;
  }

  configureOSS() {
    this.client = new OSS({
      region: this.region,
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
      bucket: this.bucket
    });
  }
}

class PhotoWall {
  constructor(ossClient, galleryElementId, thumbnailQuality = 25, prefix) {
    this.client = ossClient;
    this.galleryElementId = galleryElementId;
    this.thumbnailQuality = thumbnailQuality;
    this.loadedImages = 0;
    this.totalImages = 5;
    this.photos = [];
    this.prefix = prefix;
    this.lazyLoadImages = this.lazyLoadImages.bind(this);
    this.isElementInViewport = this.isElementInViewport.bind(this);
  }

  generatePhotoWall() {
    const galleryElement = document.getElementById(this.galleryElementId);

    this.client.list({
      'max-keys': 1000,
      'prefix': this.prefix
    }).then((result) => {
      this.photos = result.objects;

      for (let i = 0; i < Math.min(this.photos.length, this.totalImages); i++) {
        const photo = this.photos[i];

        if (photo.size && photo.name.match(/\.jpe?g$|\.png$|\.gif$/i)) {
          const photoUrl = this.client.signatureUrl(photo.name, { expires: 3600 });
          const thumbnailUrl = this.client.signatureUrl(photo.name, { expires: 3600, process: `image/auto-orient,1/quality,q_${this.thumbnailQuality}` });
          galleryElement.innerHTML += `<div class="image"><a href="${photoUrl}"><img src="${thumbnailUrl}"></a></div>`;
          this.loadedImages++;
        }
      }

      window.addEventListener('scroll', () => {
        if (this.loadedImages < this.photos.length) {
          if (this.isElementInViewport(document.querySelector('.image:last-child img'))) {
            const startIndex = this.loadedImages;
            const endIndex = Math.min(this.loadedImages + this.totalImages, this.photos.length);

            for (let i = startIndex; i < endIndex; i++) {
              const photo = this.photos[i];

              if (photo.size && photo.name.match(/\.jpe?g$|\.png$|\.gif$/i)) {
                const photoUrl = this.client.signatureUrl(photo.name, { expires: 3600 });
                const thumbnailUrl = this.client.signatureUrl(photo.name, { expires: 3600, process: `image/auto-orient,1/quality,q_${this.thumbnailQuality}` });
                galleryElement.innerHTML += `<div class="image"><a href="${photoUrl}"><img src="${thumbnailUrl}"></a></div>`;
                this.loadedImages++;
              }
            }
          }
        }

        this.lazyLoadImages();
      });

      this.lazyLoadImages();
    });
  }

  lazyLoadImages() {
    const images = document.querySelectorAll('.image img');
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (this.isElementInViewport(image) && !image.src) {
        image.src = image.getAttribute('data-src');
      }
    }
  }

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}
