### Usage

1. You should create `config.json` file in the root like this:
```json
{
	"VKtoken": "VK_ACCESS_TOKEN",
	"VKUserAgent": "VKAndroidApp/7.33-13214",
	"YMAuth": {
		"uid": 123456789,
		"access_token": "YM_ACCESS_TOKEN"
	},
	"YMplayListId": "3"
}
```
Get VK token at: https://vkhost.github.io/  
Get YM token at: https://music-yandex-bot.ru/ (View network tab)

2. Run following commands:
```sh
npm i
node index 
```
