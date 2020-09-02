all:
	make punch-in
	make punch-out
	make punch-in-schedule
	make punch-out-schedule

punch-in:
	gcloud functions deploy punchIn --trigger-http --memory 1GB --allow-unauthenticated --runtime nodejs10 --env-vars-file="./.env.yaml"

punch-out:
	gcloud functions deploy punchOut --trigger-http --memory 1GB --allow-unauthenticated --runtime nodejs10 --env-vars-file="./.env.yaml"

punch-in-schedule:
	gcloud scheduler jobs create http auto-king-miyamae-punch-in --schedule="*/3 10 * * *" --uri="https://us-central1-cdp-dev-206602.cloudfunctions.net/punchIn" --time-zone="Asia/Tokyo"

punch-out-schedule:
	gcloud scheduler jobs create http auto-king-miyamae-punch-out --schedule="*/2 20 * * *" --uri="https://us-central1-cdp-dev-206602.cloudfunctions.net/punchOut" --time-zone="Asia/Tokyo"


