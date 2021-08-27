# InstaSaved
A simple command line tool to download all images you have saved on Instagram

# Disclaimer
I used code from [pietrocaselani](https://github.com/pietrocaselani)'s [Instagram Saved Posts](https://github.com/pietrocaselani/Instagram-Saved-Posts) and integrated it into this project. Make sure to check out his repository aswell!

# Installation
Similar to [TwitterBookmarks](https://github.com/Stridsvagn69420/TwitterBookmarks#framework-dependent-binary), the execution script must be inside a folder registered in your PATH variable (e.g. /usr/bin on Linux and other Unix-like systems):  

Clone the repository, run `npm i` to install all Node modules needed and add a `cd /path/to/local/instasaved/folder` into the `instasave` script file (Node.js and NPM required)

## Adding credentials
Also similar to [TwitterBookmarks](https://github.com/Stridsvagn69420/TwitterBookmarks#platform-binary), a config file is needed where credentials and other settings are stored in.  
Create a `config.json` file inside `.config/instasave` located in your home directory that should look like this:
```js
{
    "username": "your_username", //Your username without the @
    "password": "your_password", //Your password
    "twoFA_key": "BASE32_TOTP_KEY", //You only have to use this if you use 2FA
	"downloadDir": "/path/to/instagram/images", //Absolute path to where you want your images saved 
	"delay": 50 //The delay in milliseconds needed between downloads. Change this value if you're facing errors.
}
```
Note that you should make the file only able to be read by you and no one else since your credentials are stored in there (as well as your 2FA key! 2FA won't help you on a data breach!)

## Adding 2FA key
This step is only neccesary if you're using 2FA with e.g. Google Authenticator (SMS 2FA is not supported yet).  

If your Authenticator app doesn't support directly exporting the key as text but a QR Code (like Google Authenticator) and you didn't save the key anywhere else/didn't get a key at all, copy the QR Code and use a reader to get the key in text. Google Lens supports directly reading text from QR Codes.

If you're using WinAuth, you can directly copy it by right-clicking on the account and then copying the Secrect Key into the `config.json` file.