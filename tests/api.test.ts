import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test User');
    expect(response.body.email).toContain('@example.com');
  });

  it('should create a ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({
        name: 'Ticket Creator',
        email: `creator-${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Test Ticket',
        description: 'This is a test ticket.',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Ticket');
    expect(response.body.description).toBe('This is a test ticket.');
    expect(response.body.creator_id).toBe(userId);
  });

  it('should reject ticket creation when X-User-Id is missing', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({
        title: 'Unauthorized Ticket',
        description: 'This should not be created.',
      });

    expect(response.status).toBe(401);
  });

  it('should return 404 for a non-existent user', async () => {
    const response = await request(app).get('/users/999999');

    expect(response.status).toBe(404);
  });

  it('should return 404 for a non-existent ticket', async () => {
    const response = await request(app).get('/tickets/999999');

    expect(response.status).toBe(404);
  });

  it('should support pagination and filtering on tickets', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({
        name: 'Pagination User',
        email: `pagination-${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Pagination Ticket 1',
        description: 'First ticket',
      });

    await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Pagination Ticket 2',
        description: 'Second ticket',
      });

    const paginationResponse = await request(app)
      .get('/tickets')
      .query({
        limit: 1,
        offset: 0,
      });

    expect(paginationResponse.status).toBe(200);
    expect(Array.isArray(paginationResponse.body)).toBe(true);
    expect(paginationResponse.body).toHaveLength(1);
  });
});
