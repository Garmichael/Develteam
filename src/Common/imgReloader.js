function imgReloadBlank(src) {

    let blankList = [],
        imgs = window.document.body.getElementsByTagName("img"),
        img,
        i,
        srcSegments,
        relativeSrc;

    for (i = imgs.length; i--;) {
        img = imgs[i];
        srcSegments = img.src.split('/');
        relativeSrc = '/' + srcSegments.slice(3).join('/');
        if (relativeSrc === src) {
            img.src = "/userdata/avatar_blank_100.jpg";
            blankList.push(img);
        }
    }

    return blankList;
}

function imgReloadRestore(src, blankList) {
    let i, img;

    for (i = blankList.length; i--;) {
        (img = blankList[i]).src = src;
    }
}

export default function (src) {
    let blankList,
        step = 0,
        iframe = window.document.createElement("iframe"),
        loadCallback = function (e) {
            if (!step) {
                step = 2;
                blankList = imgReloadBlank(src);
                iframe.contentWindow.location.reload(true);

            } else if (step === 2) {
                imgReloadRestore(src, blankList);
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            }
        };

    iframe.style.display = "none";
    window.parent.document.body.appendChild(iframe);
    iframe.addEventListener("load", loadCallback, false);
    iframe.addEventListener("error", loadCallback, false);
    iframe.src = src;
}
