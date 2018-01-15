.PHONY: all image package dist clean


# Scripts

all: package

image:
	docker build --tag amazonlinux:nodejs .

package: image
	docker run --rm --volume ${PWD}/lambda:/build amazonlinux:nodejs npm install --production

dist: package
	cd lambda && zip -FS -q -r ../dist/iris.zip *
	serverless package -v

clean:
	rm -r lambda/node_modules
	docker rmi --force amazonlinux:nodejs


# Determine which stage to deploy to
# If no stage is set, defaults to `dev`

ifndef stage
    STAGE=dev
else
    STAGE=$(stage)
endif


# Deploy scripts

s3-init:
	bash ./scripts/s3-init.sh $(STAGE)

deploy: dist
	sls deploy -v --stage $(STAGE)

deploy-package: dist
	sls deploy -v --package --stage $(STAGE)

test:
	aws s3 ls | grep iris-$(STAGE)-mediaserver-*