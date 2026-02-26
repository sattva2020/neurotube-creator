FROM node:22-slim
WORKDIR /app
RUN echo '{"type":"module"}' > package.json && \
    echo 'import http from "http"; const s = http.createServer((req, res) => { res.writeHead(200, {"Content-Type":"application/json"}); res.end(JSON.stringify({status:"ok",message:"minimal test"})); }); s.listen(3000, () => console.log("Listening on 3000"));' > index.mjs
EXPOSE 3000
CMD ["node", "index.mjs"]
