DEBUGMODE = true;

const _log = require("../util/_log")
const { Builder, By, Key, until, Actions } = require('selenium-webdriver');
//const { ActionChains } = require('selenium-webdriver').action_chains
// const By = require("selenium.webdriver.common.by")
// const { WebDriverWait } = require("selenium.webdriver.support.ui")
// const EC  = require("selenium.webdriver.support").expected_conditions
//from selenium.webdriver.support import expected_conditions as EC



console.log('working at all?')
_log('log working')

const test10003 = "https://weather.com/weather/today/l/cb46bc6f0574ad07ae6658ea2f0712d622d0e6136619cc72dc0a22eec954feae"  // after new zip
class getWeatherUrl {
  initialize() {
    this.driver = null
    console.log("setWeatherUrl test10003 length:", test10003.length)
    _log("typeof EC", typeof EC)

  }

  async getDriver() {
    try {
      _log("setWeatherUrl test10003 length:", test10003.length)
      this.driver = await new Builder().forBrowser('chrome').build()
      _log('driver keys:', Object.keys(this.driver))
      _log(`typeof actions ${typeof this.driver.actions}`)
      return this
    }
    catch (err) {
      _log("can't get chome driver:" + err)
      return null
    }


    // let promise = new Promise((resolve, reject) => {
    //   try {
    //     this.driver = await new Builder().forBrowser('chrome').build()
    //     this.resolve(this)
    //   }
    //   catch (err) {
    //     reject("can't get chome driver:" + err)
    //   }
    // })
  }

  // 10001
  // /weather/radar/interactive/l/2fed15ede5b6d52dc97504c4eae63c29cb7c81d3ae3a56efb847e3b712421eab?layer=radar
  // /weather/radar/interactive/l/227f0535c56f23fb4ef109e9278320bf1720daca012edbf67e8e34d6c7632950?layer=radar

  // 58503
  // "/weather/radar/interactive/l/183c1eedd9e3cb006c4608a271684c7685befd77c44a557b8b81c8037bc8989c?layer=radar"

  async getWeatherUrl(zip) {
    try {
      _log("in getWeatherUrl for zip:" + zip.toString())
      await this.driver.get('http://www.weather.com');
      let title = await this.driver.getTitle()
      _log('title:' + title)
      //const jse = (JavascriptExecutor)(this.driver);
      try {
        // jse.executeScript("document.getElementsByClassName('theme__inputElement__4bZUj input__inputElement__1GjGE')[0].click();");

        const input = await this.driver.findElement(By.className('theme__inputElement__4bZUj input__inputElement__1GjGE'))
        const actions = this.driver.actions()
        // _log('keys of actions:', Object.keys(actions))
        try {
          await this.driver.actions()
            .move(input)
            .click(input)
            .sendKeys(zip.toString(), Key.RETURN)
            .perform()
        }
        catch (err) {
          _log('driver actions to send keys:', err.stack)
        }
      }
      catch (err) {
        _log("can't set zip ", err.stack)
        return err
      }
      try {
        _log('testregex', By.xpath('matches("abracadabra", "^a.*a$")').length)
/*
<a href="https://weather.com/weather/today/l/33143:4:US" title="Miami, FL, UNITED STATES OF AMERICA" classname="styles__itemLink__23h5a" class="styles__itemLink__23h5a">Miami, FL, UNITED STATES OF AMERICA</a>
https://weather.com/en-US/search/enhancedlocalsearch?where=33143&loctypes=1/4/5/9/11/13/19/21/1000/1001/1003/&from=hdr
https://weather.com/weather/today/l/33143:4:US
*/
        // const wait = new WebDriverWait(this.driver, 20);
        // wait.until(wd => {
        //   const href = 

        // })
        this.driver.wait(until.elementLocated(By.xpath("a[matches(@href,\
          'https\://weather.com/(weather/today/l|en-US/search/enhancedlocalsearch).+')]")
        ), 5 * 1000).then(el => {
            _log('el', el)
        });
      


        const map = await this.driver.wait(until.elementLocated(By.xpath('a[@class=styles__maplink__1SoBQ]')));
        try {
          _log('href', map.getAttribute("href"))
          _log('map', map)

        }
        catch (err) {
          _log('map failed:', err)
        }

      }
      catch (err) {
        console.log(err.stack)
        title = await this.driver.getTitle()
        _log('after zip title:' + title)
      }

    } finally {
      _log('driver quit')
      await this.driver.quit();
    }
  }
}

const s = new getWeatherUrl()
s.getDriver()
  .then(d => {
    _log("shit")
    console.log(d !== null)
    d.getWeatherUrl(33143)
      .then(() => {
        _log('setWeatherUrl')
      })
      .catch(err => {
        _log('failed to setWeatherUrl')
      })
  })
  .catch(err => {
    _log(err)
  })

