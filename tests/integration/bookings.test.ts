import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createTicket, createTicketTypeRemote, createTicketTypeWithHotel, createUser } from "../factories";
import { createBooking } from "../factories/bookings-factory";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);




describe("GET /booking", () => {
  
  it("should respond with status 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.get("/booking").set(`Authorization`, `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 200 and booking data if there is an booking", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id)
    const booking = await createBooking(user.id, room.id)

    const response = await server.get("/booking").set(`Authorization`, `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      id: booking.id,
      Room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        hotelId: room.hotelId,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString()      
      }
    });
  });
});




describe("POST /booking", () => {

  beforeEach(async () => {
    await cleanDb();
  });
  
  it("should respond with status 403 if there is no enrollment", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id)

    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if there is no ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id)
    const enrollment = await createEnrollmentWithAddress(user)

    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if ticket not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, "RESERVED");


    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if ticket type is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");


    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 200 if all is ok", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");


    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.OK);
  });

  it("should respond with status 404 if roomId not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");


    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: 0});
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 if the room is full", async () => {
    const user = await createUser();
    const user2 = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await createBooking(user2.id, room.id)
    await createBooking(user2.id, room.id)
    await createBooking(user2.id, room.id)
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");


    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if booking alredy exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await createBooking(user.id, room.id)
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");


    const response = await server.post("/booking").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});


describe("PUT /booking/:bookingId", () => {
  
  beforeEach(async () => {
    await cleanDb();
  });

  it("should respond with status 404 if bookingId not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    const response = await server.put("/booking/0").set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 if user without booking", async () => {
    const user = await createUser();
    const user2 = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user2.id, room.id)

    const response = await server.put(`/booking/${booking.id}`).set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 200 if all is ok", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id)

    const response = await server.put(`/booking/${booking.id}`).set(`Authorization`, `Bearer ${token}`).send({roomId: room.id});
    
    expect(response.status).toBe(httpStatus.OK);
  });

  it("should respond with status 404 if roomId not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id)

    const response = await server.put(`/booking/${booking.id}`).set(`Authorization`, `Bearer ${token}`).send({roomId: 0});
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 if room is full", async () => {
    const user = await createUser();
    const user2 = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const room2 = await createRoomWithHotelId(hotel.id);
    await createBooking(user2.id, room2.id)
    await createBooking(user2.id, room2.id)
    await createBooking(user2.id, room2.id)
    const booking = await createBooking(user.id, room.id)

    const response = await server.put(`/booking/${booking.id}`).set(`Authorization`, `Bearer ${token}`).send({roomId: room2.id});
    
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

});