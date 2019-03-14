var admobid = {};

if (/(android)/i.test(navigator.userAgent)) {
    admobid = { // for Android
        banner: 'ca-app-pub-7286080094853397/1031583055',
        interstitial: 'ca-app-pub-7286080094853397/1027713620',
        rewardvideo: 'ca-app-pub-7286080094853397/1064400310',
    };
} else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
    admobid = { // for iOS
        banner: 'ca-app-pub-7286080094853397/1031583055',
        interstitial: 'ca-app-pub-7286080094853397/1027713620',
        rewardvideo: 'ca-app-pub-7286080094853397/1064400310',
    };
} else {
    admobid = { // for Windows Phone, deprecated
        banner: '',
        interstitial: '',
        rewardvideo: '',
    };
}

const IS_TESTING = false;

// INTERSTITIAL

function prepareInterstitial() {
    if (typeof AdMob == 'undefined' || !AdMob) {
        return;
    }
    AdMob.prepareInterstitial({
        adId: admobid.interstitial,
        isTesting: IS_TESTING,
        autoShow: false
    }, function () { // success
        // alert("Succesfully loaded interstitial.");
    }, function () { // fail
        alert("Failed loading interstitial.");
    });
}

function showInterstitial() {
    if (typeof AdMob == 'undefined' || !AdMob) {
        return;
    }

    AdMob.isInterstitialReady(function (isready) {
        if (isready) {
            AdMob.showInterstitial();
        } else {
            prepareInterstitial();
        }
    });
}

// REWARDED

function prepareRewardVideoAd() {
    if (typeof AdMob == 'undefined' || !AdMob) {
        return;
    }
    AdMob.prepareRewardVideoAd({
        adId: admobid.rewardvideo,
        isTesting: IS_TESTING,
        autoShow: true,
    }, function () { // success
        // alert("Succesfully loaded rewarded.");
    }, function () { // fail
        alert("Failed loading rewarded.");
    });
}

function showRewardVideoAd() {
    if (typeof AdMob == 'undefined' || !AdMob) {
        return;
    }
    AdMob.showRewardVideoAd();
}

// INIT APP

function initApp() {
    if (typeof AdMob == 'undefined' || !AdMob) {
        console.log('AdMob plugin not ready | initApp');
        return;
    }

    // this will create a banner on startup
    AdMob.createBanner({
        adId: admobid.banner,
        position: AdMob.AD_POSITION.BOTTOM_CENTER,
        isTesting: IS_TESTING,
        autoShow: true,
        overlap: true,
    }, function () { // success
        // alert("Succesfully loaded banner.");
    }, function () { // fail
        alert("Failed loading banner.");
    });

    prepareInterstitial();
    // prepareRewardVideoAd();
}


// EVENT LISTENERS

if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
    document.addEventListener('deviceready', initApp, false);
} else {
    initApp();
}

$(document).on('onAdDismiss', function (e) {
    // prepare new interstitial after user closed interstitial
    prepareInterstitial();
});

$(document).on('onAdFailLoad', function (e) {
    if (typeof e.originalEvent !== 'undefined') {
        e = e.originalEvent;
    }

    var data = e.detail || e.data || e;

    // alert('error: ' + data.error +
    //     ', reason: ' + data.reason +
    //     ', adNetwork:' + data.adNetwork +
    //     ', adType:' + data.adType +
    //     ', adEvent:' + data.adEvent);
});