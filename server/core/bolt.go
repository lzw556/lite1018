package core

import "go.etcd.io/bbolt"

type Bucket interface {
	BucketName() string
}

func BoltDB() *bbolt.DB {
	db, err := bbolt.Open("./data/cloud.db", 0600, nil)
	if err != nil {
		panic(err)
	}
	return db
}
