Feature: Run and view appointment resource planning report
  As a TO Manager
  I want to view the number of interviews scheduled at a defined time and whether a translator or Welsh speaker is required
  So that I can deploy resources to areas where and when they are needed

  # Scenario 1:
  Scenario: Run and view appointment resource planning report
    Given A survey tla and date has been specified
    When I click next to retrieve a list of questionnaires
    When I select a questionnaire and click on run report
    Then I will receive a list of the following information for appointments made:
    """
      * Questionnaire
      * Appointment Time
      * Appointment Language
    """
    And the information will be displayed in time intervals of quarter of an hour, e.g. 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, etc.

