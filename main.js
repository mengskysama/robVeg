const music = "/storage/emulated/0/netease/cloudmusic/Music/Sound Horizon - 美しきもの.mp3"

// 解锁手机屏幕，仅兼容部分手机，如果手机不支持请提前解除锁定再运行
function unLock() {
    if (!device.isScreenOn()) {
        device.wakeUp()
        sleep(500)
        swipe(500, 2000, 500, 1000, 200)
        sleep(500)
        const password = "123456" //这里换成自己的手机解锁密码
        for (let i = 0; i < password.length; i++) {
            let position = text(password[i]).findOne().bounds()
            click(position.centerX(), position.centerY())
            sleep(100)
        }
    }
    sleep(1000)
}

//抢菜流程
function 买买买() {
    unLock()
    launchApp("美团买菜")
    waitForPackage("com.meituan.retail.v.android", 200)
    auto.waitFor()
    const btn_skip = id("btn_skip").findOne(2000)
    if (btn_skip) {
        btn_skip.click()
        toast("已跳过首屏广告")
    }
    sleep(2000)
    gotoBuyCart()
    sleep(2000)
    checkAll()
    sleep(2000)
    while (true) {
        submitOrder()
    }
}

//重新加载购物车
function reloadCart() {
    while (text("重新加载").exists()) {
        text("重新加载").findOne(1).parent().click()
        sleep(2000)
    }
}

//打开购物车页面
function gotoBuyCart() {
    if (id("img_shopping_cart").exists()) {
        id("img_shopping_cart").findOne().parent().click();
        sleep(2000)
        reloadCart()
        toast("已进入购物车")
    } else {
        toast("没找到购物车")
        exit
    }
}

//勾选全部商品
function checkAll() {
    const isCheckedAll = textStartsWith("结算(").exists()
    const checkAllBtn = text("全选").findOne()
    if (!!checkAllBtn) {
        !isCheckedAll && checkAllBtn.parent().click()
        sleep(1000)
    } else {
        toast("没找到全选按钮")
        exit
    }
}

// 点击按钮
function clickBtn(str, loop) {
    try {
        // 结算过程可能是可重入的，有时候会崩出多个框
        textStartsWith(str).findOne(1).parent().click()
        while (loop) {
            sleep(10)
            textStartsWith(str).findOne(1).parent().click()
        }
    } catch (e) {
    }
}

// fixme textStartsWith("返回购物车").findOne(1).parent().click() not work
function fixed() {
    try {
        if (textStartsWith("前方拥堵，请稍后再试").exists()) {
            className("android.view.View").depth(15).findOne(1).parent().click()
        }
    } catch (e) {
    }
}

// 订单创建完成
function QuitWhenOrderCreate() {
    if (text("确认支付").exists()) {
        media.playMusic(music)
        sleep(media.getMusicDuration())
        exit
    }
}

// 提交订单，每次提交不能小于一秒，否则容易触发限流
function submitOrder() {
    clickBtn("结算(", false)

    // 尽可能快的发起支付
    for (let i = 1; i < 5; i++) {
        clickBtn("立即支付", true)
        fixed()
        sleep(100)
    }
    
    clickBtn("我知道了", true)
    clickBtn("重新加载", true)
    clickBtn("前方拥堵", true)
    clickBtn("返回购物车", true)
    fixed()

    QuitWhenOrderCreate()
}


买买买()
