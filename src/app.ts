const adsLib = ['./adsLibrary/Huel'];

function bootAdsLibrary() {
  for (const ads of adsLib) {
    import(ads).then((ad) => ad.start());
  }
}

bootAdsLibrary();
