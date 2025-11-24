import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiciosComponent } from './servicios.component';
import { ServiciosService } from './servicios.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('ServiciosComponent', () => {
  let component: ServiciosComponent;
  let fixture: ComponentFixture<ServiciosComponent>;
  
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ServiciosComponent]
      })
      .compileComponents();
  
      fixture = TestBed.createComponent(ServiciosComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  
    it('should create', () => {
      expect(component).toBeTruthy();
    });
});
