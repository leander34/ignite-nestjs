


Controller porta de entrada para aplicação, via http, o controle receber a requisição




### Windows Usar Git Bash ###

openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

openssl rsa -pubout -in private_key.pem -out public_key.pem

### Somente para MAC ###
base64 -i private_key.pem -o private_key-base64.txt

base64 -i public_key.pem -o public_key-base64.txt

### Windows Usar Git Bash ###

// Obs : base64 -w 0: Converte a entrada em base64, evitando quebras de linha.

base64 -w 0 private_key.pem > private_key-base64.txt

base64 -w 0 public_key.pem > public_key-base64.txt
