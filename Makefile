key:
	cp .env.example .env
reset:
	rm -rf .next
	rm -rf node_modules
	rm package-lock.json
	npm cache clear --force
	npm cache clean --force
	npm i
dev:
	npm run dev
build:
	npm run build
update:
	 npx -p npm-check-updates  -c "ncu -u"
	@make package-clear-legacy
package-clear-legacy:
	npm install --legacy-peer-deps --force
	npm audit fix --force
d-up:
	docker-compose up
d-up-d:
	docker-compose up -d
d-build:
	@make d-clean && docker-compose build --no-cache
d-down:
	docker-compose down
d-clean:
	docker images -q | xargs -r docker rmi -f && docker system prune -a && docker-compose down --volumes --remove-orphans
d-stats:
	docker stats
d-exec:
	docker-compose exec app bash
migrate:
	docker-compose exec app npx prisma migrate dev && docker-compose exec app npx prisma generate
studio:
	docker-compose exec app npx prisma studio
pri-seed:
	docker-compose exec app npx prisma db seed
db-reset:
	docker-compose down && docker volume rm lgenerater_postgres_data
db-access: # -Uと-dの値は.envのDB_USERとDB_NAMEの値を入れる
	docker-compose exec db psql -U user -d mydb
check-3000: # 3000を使ってる環境のチェック
	lsof -i :3000
kill-9: # 3000を使ってる環境のチェック
	 kill -9 〇〇
