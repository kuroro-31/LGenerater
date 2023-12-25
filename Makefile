key:
	cp .env.example .env.local
reset:
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
up:
	docker-compose up
up-d:
	docker-compose up -d
d-build:
	docker-compose build --no-cache
down:
	docker-compose down
d-clean:
	docker images -q | xargs -r docker rmi -f && docker system prune -a
d-stats:
	docker stats
exec:
	docker exec -it lgenerater_app_1 /bin/bash
