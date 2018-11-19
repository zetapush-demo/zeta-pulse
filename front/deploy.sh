#!/bin/bash

# Deploy the zetapulse Front to the server
echo Start deploy zetapulse...

# echo Clean the directory
# ssh -o StrictHostKeyChecking=no root@vps247932.ovh.net rm -r /var/www/demo2_zetapush/*

echo Send new version of the front
scp -o StrictHostKeyChecking=no -r ./dist/zetapulse/* root@vps247932.ovh.net:/var/www/demo2_zetapush/zetapulse

exit 0