# API Rate Limiter

A scalable backend service built with Node.js, Express.js, Redis, and MongoDB that enforces API rate limits to prevent abuse and ensure reliable service availability. The project uses Redis atomic counters and TTL-based expiration to efficiently track requests and throttle clients without introducing database bottlenecks.

## Features

* API rate limiting using Redis
* JWT-based authentication and authorization
* API key generation and management
* Secure credential storage with bcrypt hashing
* MongoDB-based persistence for users and API metadata
* Modular middleware architecture
* RESTful API design
* Configurable request limits and expiration windows

## Tech Stack

* Node.js
* Express.js
* Redis
* MongoDB
* Mongoose
* JWT
* Bcrypt

## Learning Outcomes

This project demonstrates backend engineering concepts such as API security, authentication, authorization, caching, distributed request tracking, middleware design, and scalable service architecture.
