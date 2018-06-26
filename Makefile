initdb:
	@yarn db:init

rmdb:
	@rm wallpapers.db

clean:
	@rm tmp/*
	@rm wallpapers/*