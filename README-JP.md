# mc-farming-bot
マイクラ用簡易的な自動農業bot．

# 対応
1.16.5で動作確認．1.17以上は非対応．

# config.json

## online
```json
{
    "host": "host-to-connect",
    "offline": true
}
```

## offline

```json
{
    "host": "host-to-connect",
    "username": "your-email",
    "password": "your-password"
}
```

# Setup
1. `config.json`を上記のように作成
1. チェストを `#seeds`, `#wheats`, そして `#toComposter`の名前で作成
1. 種を`#seeds`に入れる
1. チェストの近くに `white_bed`を置く
1. `npm start`でbotログイン.チェストとベッドの近くで起動することをおすすめします
1. うまく行けばbotが自動的に農業を開始します