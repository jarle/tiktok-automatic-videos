FROM node:18-buster

RUN apt install python3 python3-pip
WORKDIR /app

COPY generate-assets/requirements.txt generate-assets/requirements.txt 
RUN pip3 install -r generate-assets/requirements.txt

COPY video-generator/package.json video-generator/package.json
RUN (cd video-generator && yarn install --production)

COPY . .

CMD ["bash", "run.sh"]
