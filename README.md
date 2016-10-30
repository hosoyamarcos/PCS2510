# PCS2510-Multimidia e Hipermidia

Projeto usando Kurento Media Server para comunicacao em tempo real, utilizando a tecnologia WebRTC

### Para rodar
1) Instalar e executar Media Server em Ubuntu 14.x
```sh
$ sudo service kurentoM-media-server-6.0 start
```
2) Clonar:
```sh
$ git clone <file_repos>
```
Obs: **Nao** precisa rodar `npm install ` ou `bower install`. Somente clonar.
3) Configurar o `server.js` de acordo com o IP do kurento media server e application server.

- Linha 29 ou em `as_uri:` é o endereco do application server. Ex:
```sh
as_uri: "https://xxx.xxx.xxx.xxx:8080/"
```
- Linha 31 ou em `ws_uri`: é o endereco do kurento media server. Ex:
```sh
ws_uri: "ws://xxxx.xxx.xxx.xxx:8888/kurento"
```
4) Executar o servidor Node da aplicacao no 'root' do repositorio clonado
```sh
$ node server.js
```
5) Abrir URL definida no endereco do servidor. Ex
```sh
"https://xxx.xxx.xxx.xxx:8080/"
```
**Open Source :) **
