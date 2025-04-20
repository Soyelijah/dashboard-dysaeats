import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { EventStoreService } from '../services/event-store.service';
import { SaveEventDto } from '../dto/save-event.dto';
import { SaveSnapshotDto } from '../dto/save-snapshot.dto';
import { Event } from '../entities/event.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Event Sourcing')
@Controller('event-store')
export class EventStoreController {
  constructor(private readonly eventStoreService: EventStoreService) {}

  @Post('events')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async saveEvent(@Body() saveEventDto: SaveEventDto): Promise<Event> {
    return this.eventStoreService.saveEvent(saveEventDto);
  }

  @Get('events/:aggregateType/:aggregateId')
  @ApiOperation({ summary: 'Get events for an aggregate' })
  @ApiParam({ name: 'aggregateType', description: 'Type of the aggregate' })
  @ApiParam({ name: 'aggregateId', description: 'ID of the aggregate' })
  async getEvents(
    @Param('aggregateType') aggregateType: string,
    @Param('aggregateId') aggregateId: string,
    @Query('fromVersion') fromVersion?: number,
  ): Promise<Event[]> {
    return this.eventStoreService.getEvents(
      aggregateType,
      aggregateId,
      fromVersion ? parseInt(fromVersion.toString()) : 0,
    );
  }

  @Get('latest-version/:aggregateType/:aggregateId')
  @ApiOperation({ summary: 'Get latest version for an aggregate' })
  async getLatestVersion(
    @Param('aggregateType') aggregateType: string,
    @Param('aggregateId') aggregateId: string,
  ): Promise<{ version: number }> {
    const version = await this.eventStoreService.getLatestVersion(
      aggregateType,
      aggregateId,
    );
    return { version };
  }

  @Get('snapshots/:aggregateType/:aggregateId')
  @ApiOperation({ summary: 'Get latest snapshot for an aggregate' })
  async getLatestSnapshot(
    @Param('aggregateType') aggregateType: string,
    @Param('aggregateId') aggregateId: string,
  ): Promise<Snapshot | null> {
    return this.eventStoreService.getLatestSnapshot(
      aggregateType,
      aggregateId,
    );
  }

  @Post('snapshots')
  @ApiOperation({ summary: 'Create a new snapshot' })
  async saveSnapshot(
    @Body() saveSnapshotDto: SaveSnapshotDto,
  ): Promise<Snapshot> {
    return this.eventStoreService.saveSnapshot(saveSnapshotDto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete an event by ID' })
  @ApiParam({ name: 'id', description: 'ID of the event to delete' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the event first to make sure it exists
      const event = await this.eventStoreService.getEventById(id);
      
      if (!event) {
        return {
          success: false,
          message: 'Event not found',
        };
      }
      
      await this.eventStoreService.deleteEvent(id);
      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete event: ${error.message}`,
      };
    }
  }
  
  @Get('events/:id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({ name: 'id', description: 'ID of the event' })
  async getEventById(@Param('id') id: string): Promise<Event | null> {
    return this.eventStoreService.getEventById(id);
  }
}