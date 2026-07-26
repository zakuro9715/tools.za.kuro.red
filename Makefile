.PHONY: clean clean-og-images og-images

og-images:
	sh ./scripts/generate-og-images.sh

clean-og-images:
	sh ./scripts/clean-og-images.sh

clean: clean-og-images

